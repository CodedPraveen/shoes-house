import { prisma } from "@/lib/db";
import { razorpayService } from "@/services/payment/razorpay-service";
import { cartService } from "@/services/cart-service";
import { notDeleted } from "@/lib/prisma-helpers";
import { fromPaise } from "@/lib/shipping";
import {
  findProcessedPayment,
  logDuplicatePayment,
} from "@/services/payment/payment-idempotency";
import { logWebhook } from "@/lib/webhook-logger";
import { decrementStockForSale } from "@/services/inventory-service";
import {
  InsufficientStockError,
  PaymentAmountMismatchError,
} from "@/lib/inventory-errors";
import { acquireLock, releaseLock } from "@/lib/redis/lock";
import { saveShippingAddressForUser } from "@/services/address-service";

/**
 * Verified-payment fulfillment: create Order, Payment PAID, decrement stock, clear cart.
 * Idempotent on razorpayPaymentId + checkout session status lock.
 */
export async function fulfillPaidCheckout({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature = null,
  amountPaise,
  fromWebhook = false,
  rawPayload = null,
  webhookEventId = null,
  expectedUserId = null,
}) {

  const existingPayment = await findProcessedPayment(razorpayPaymentId);
  if (existingPayment) {
    if (expectedUserId && existingPayment.order?.userId !== expectedUserId) {
      throw new Error("Payment does not belong to this user");
    }

    const backfill = {};
    if (!existingPayment.razorpaySignature && razorpaySignature) {
      backfill.razorpaySignature = razorpaySignature;
    }
    if (!existingPayment.webhookEventId && webhookEventId) {
      backfill.webhookEventId = webhookEventId;
    }
    if (!existingPayment.rawPayload && rawPayload) {
      backfill.rawPayload = rawPayload;
    }
    if (Object.keys(backfill).length > 0) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: backfill,
      });
    }

    logDuplicatePayment({
      razorpayPaymentId,
      razorpayOrderId,
      webhookEventId,
      orderId: existingPayment.orderId,
      orderNumber: existingPayment.order?.orderNumber,
    });
    return {
      ok: true,
      duplicate: true,
      orderId: existingPayment.orderId,
      orderNumber: existingPayment.order?.orderNumber,
    };
  }

  if (!fromWebhook) {
    if (
      !razorpaySignature ||
      !razorpayService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        signature: razorpaySignature,
      })
    ) {
      throw new Error("Invalid Razorpay payment signature");
    }
  }

  const session = await prisma.checkoutSession.findFirst({
    where: { razorpayOrderId },
    include: { items: true, user: true },
  });

  if (!session) {
    throw new Error("Checkout session not found");
  }

  if (expectedUserId && session.userId !== expectedUserId) {
    throw new Error("Checkout session does not belong to this user");
  }

  if (session.status === "COMPLETED" && session.orderId) {
    logDuplicatePayment({
      razorpayPaymentId,
      razorpayOrderId,
      webhookEventId,
      orderId: session.orderId,
    });
    return { ok: true, duplicate: true, orderId: session.orderId };
  }

  const paidRupees = fromPaise(amountPaise);
  if (paidRupees !== session.total) {
    throw new PaymentAmountMismatchError("Payment amount mismatch", {
      expected: session.total,
      received: paidRupees,
      razorpayOrderId,
      razorpayPaymentId,
    });
  }

  const user = await prisma.user.findFirst({
    where: { id: session.userId, ...notDeleted },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const redisLocks = [];

  try {

    for (const item of session.items) {
      const key = `variant:${item.variantId}`;

      const ok = await acquireLock(key, 30);

      if (!ok) {
        throw new Error("Product is currently being processed.");
      }

      redisLocks.push(key);
    }

    const result = await prisma.$transaction(async (tx) => {
      const locked = await tx.checkoutSession.updateMany({
        where: {
          id: session.id,
          status: { in: ["PENDING", "FAILED", "EXPIRED"] },
        },
        data: { updatedAt: new Date() },
      });

      if (locked.count === 0) {
        const completed = await tx.checkoutSession.findUnique({
          where: { id: session.id },
          select: { orderId: true, status: true },
        });
        if (completed?.status === "COMPLETED" && completed.orderId) {
          return { duplicate: true, orderId: completed.orderId };
        }
        throw new Error("Checkout session is not available for fulfillment");
      }

      const paidAgain = await tx.payment.findFirst({
        where: { razorpayPaymentId, status: "PAID", deletedAt: null },
      });

      if (paidAgain) {
        return { duplicate: true, orderId: paidAgain.orderId };
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session.userId,
          status: "PROCESSING",
          subtotal: session.subtotal,
          shippingCost: session.shippingCost,
          total: session.total,
          shipFullName: session.shipFullName,
          shipPhone: session.shipPhone,
          shipLine1: session.shipLine1,
          shipLandmark: session.shipLandmark,
          shipLine2: session.shipLine2,
          shipState: session.shipState,
          shipCity: session.shipCity,
          shipCountry: session.shipCountry,
          shipPincode: session.shipPincode,
          items: {
            create: session.items.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              productName: line.productName,
              productImage: line.productImage,
              productSku: line.productSku,
              priceAtPurchase: line.priceAtPurchase,
              color: line.color,
              size: line.size,
              quantity: line.quantity,
            })),
          },
        },
      });

      for (const line of session.items) {

        if (!line.variantId) {
          throw new Error(`Missing variant for ${line.productSku}`);
        }

        await decrementStockForSale(tx, {
          variantId: line.variantId,
          quantity: line.quantity,
          orderId: order.id,
          reason: `Sale · order ${order.orderNumber}`,
          sku: line.productSku,
        });
      }

      await tx.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: session.total,
          currency: "INR",
          status: "PAID",
          paymentMethod: "Razorpay",
          rawPayload: rawPayload ?? undefined,
          webhookEventId: webhookEventId ?? undefined,
        },
      });

      await saveShippingAddressForUser(tx, session.userId, {
        label: session.shipAddressLabel || "Home",
        fullName: session.shipFullName,
        phone: session.shipPhone,
        line1: session.shipLine1,
        landmark: session.shipLandmark,
        line2: session.shipLine2,
        city: session.shipCity,
        state: session.shipState,
        country: session.shipCountry,
        pincode: session.shipPincode,
      });

      if (session.mode !== "BUY_NOW") {
        await cartService.clearCartInTransaction(tx, session.userId);
      }

      await tx.checkoutSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", orderId: order.id },
      });

      for (const line of session.items) {
        await tx.product.update({
          where: { id: line.productId },
          data: { purchaseCount: { increment: line.quantity } },
        });
      }

      return { duplicate: false, order };

    });

    if (result.duplicate) {
      logDuplicatePayment({
        razorpayPaymentId,
        razorpayOrderId,
        webhookEventId,
        orderId: result.orderId,
      });
      return { ok: true, duplicate: true, orderId: result.orderId };
    }

    if (session.mode !== "BUY_NOW") {
      await cartService.invalidateCartCache(session.userId);
    }

    logWebhook("FULFILLED", {
      razorpayPaymentId,
      razorpayOrderId,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      webhookEventId,
    });

    return {
      ok: true,
      duplicate: false,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
    };
  }
  catch (err) {
    if (err instanceof InsufficientStockError) {
      throw err;
    }
    if (err instanceof PaymentAmountMismatchError) {
      throw err;
    }
    if (err.code === "P2002") {
      const dup = await findProcessedPayment(razorpayPaymentId);
      if (dup) {
        if (expectedUserId && dup.order?.userId !== expectedUserId) {
          throw new Error("Payment does not belong to this user");
        }
        logDuplicatePayment({
          razorpayPaymentId,
          razorpayOrderId,
          webhookEventId,
          orderId: dup.orderId,
          orderNumber: dup.order?.orderNumber,
        });
        return {
          ok: true,
          duplicate: true,
          orderId: dup.orderId,
          orderNumber: dup.order?.orderNumber,
        };
      }
    }
    throw err;
  }
  finally {

    await Promise.all(redisLocks.map(releaseLock));

  }
}
export async function markSessionFailed(razorpayOrderId) {
  await prisma.checkoutSession.updateMany({
    where: { razorpayOrderId, status: "PENDING" },
    data: { status: "FAILED" },
  });
}
