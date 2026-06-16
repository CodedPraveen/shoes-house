import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/order-number";
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

/**
 * Webhook-only fulfillment: create Order, Payment PAID, decrement stock, clear cart.
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
}) {
  const existingPayment = await findProcessedPayment(razorpayPaymentId);
  if (existingPayment) {
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

  if (session.status === "COMPLETED" && session.orderId) {
    logDuplicatePayment({
      razorpayPaymentId,
      razorpayOrderId,
      webhookEventId,
      orderId: session.orderId,
    });
    return { ok: true, duplicate: true, orderId: session.orderId };
  }

  if (session.expiresAt < new Date()) {
    await prisma.checkoutSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("Checkout session expired");
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

  const orderNumber = await generateOrderNumber();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const locked = await tx.checkoutSession.updateMany({
        where: { id: session.id, status: "PENDING" },
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

      console.log("ORDER CREATED", order.id);

      for (const line of session.items) {

        console.log("DECREMENTING", line.productSku);

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
        console.log("DECREMENTED SUCCESSFULLY", line.productSku);
      }

      console.log("CREATING PAYMENT");

      await tx.payment.create({
        data: {
          orderId: order.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
          amount: session.total,
          currency: "INR",
          status: "PAID",
          rawPayload: rawPayload ?? undefined,
          webhookEventId: webhookEventId ?? undefined,
        },
      });
      console.log("UPDATING SESSION");

      await tx.checkoutSession.update({
        where: { id: session.id },
        data: { status: "COMPLETED", orderId: order.id },
      });

      console.log("UPDATING PURCHASE COUNT");

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
      await cartService.clearCart(session.userId);
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
  } catch (err) {
    if (err instanceof InsufficientStockError) {
      throw err;
    }
    if (err instanceof PaymentAmountMismatchError) {
      throw err;
    }
    if (err.code === "P2002") {
      const dup = await findProcessedPayment(razorpayPaymentId);
      if (dup) {
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
}

export async function markSessionFailed(razorpayOrderId) {
  await prisma.checkoutSession.updateMany({
    where: { razorpayOrderId, status: "PENDING" },
    data: { status: "FAILED" },
  });
}
