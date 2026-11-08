
import { prisma } from "@/lib/db";
import { razorpayService } from "@/services/payment/razorpay-service";
import { cartService } from "@/services/cart-service";
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
import { guestOrderAccessService } from "@/services/guest/guest-order-access-service";
import { createOrderNotificationOutboxes } from "@/services/notifications/order-notification-outbox";
import { enqueueOrderNotifications } from "@/queues/order-notification.queue";

async function queueGuestOrderNotifications(session, orderId, rawGuestToken) {
  if (session.userId || (!rawGuestToken && !session.guestAccessTokenCiphertext)) return;
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    await createOrderNotificationOutboxes(prisma, {
      order,
      rawGuestToken,
      encryptedGuestToken: session.guestAccessTokenCiphertext,
    });
    await prisma.checkoutSession.update({
      where: { id: session.id },
      data: { guestAccessTokenCiphertext: null },
    });
    await enqueueOrderNotifications(orderId).catch(() => null);
  } catch {
    // Notification persistence/delivery never changes fulfillment success.
  }
}

export async function fulfillPaidCheckout({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature = null,
  amountPaise,
  fromWebhook = false,
  rawPayload = null,
  webhookEventId = null,
  expectedUserId = null,
  guestAccessToken = null,
}) {
  const session = await prisma.checkoutSession.findFirst({
    where: { razorpayOrderId },
    include: { items: true },
  });

  if (!session) {
    throw new Error("Checkout session not found");
  }

  if (!session.userId && !fromWebhook && !guestOrderAccessService.validateToken(
    guestAccessToken,
    session.guestAccessTokenHash,
  )) {
    throw new Error("Guest checkout token is invalid");
  }

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

    if (Object.keys(backfill).length) {
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

    await queueGuestOrderNotifications(session, existingPayment.orderId, guestAccessToken);

    return {
      ok: true,
      duplicate: true,
      orderId: existingPayment.orderId,
      orderNumber: existingPayment.order?.orderNumber,
      guestAccessToken: session.userId ? null : guestAccessToken,
    };
  }

  if (
    !fromWebhook &&
    (
      !razorpaySignature ||
      !razorpayService.verifyPaymentSignature({
        razorpayOrderId,
        razorpayPaymentId,
        signature: razorpaySignature,
      })
    )
  ) {
    throw new Error("Invalid Razorpay payment signature");
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

    await queueGuestOrderNotifications(session, session.orderId, guestAccessToken);

    return {
      ok: true,
      duplicate: true,
      orderId: session.orderId,
      guestAccessToken: session.userId ? null : guestAccessToken,
    };
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

  if (session.userId) {
    const user = await prisma.user.findFirst({
      where: {
        id: session.userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!user) {
      throw new Error("Checkout user no longer exists");
    }
  } else if (!session.guestEmail || !session.guestAccessTokenHash) {
    throw new Error("Guest checkout access information is missing");
  }

  const orderNumber = `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 11)
    .toUpperCase()}`;

  const redisLocks = [];

  try {
    const productIds = [
      ...new Set(session.items.map((item) => item.productId)),
    ].sort();

    for (const productId of productIds) {
      const key = `product:${productId}`;
      const acquired = await acquireLock(key, 30);

      if (!acquired) {
        throw new Error("Product is currently being processed.");
      }

      redisLocks.push(key);
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const locked = await tx.checkoutSession.updateMany({
          where: {
            id: session.id,
            status: { in: ["PENDING", "FAILED", "EXPIRED"] },
          },
          data: { updatedAt: new Date() },
        });

        if (!locked.count) {
          const completed = await tx.checkoutSession.findUnique({
            where: { id: session.id },
            select: { orderId: true, status: true },
          });

          if (completed?.status === "COMPLETED" && completed.orderId) {
            return {
              duplicate: true,
              orderId: completed.orderId,
            };
          }

          throw new Error("Checkout session is not available for fulfillment");
        }

        const paidAgain = await tx.payment.findFirst({
          where: {
            razorpayPaymentId,
            status: "PAID",
            deletedAt: null,
          },
        });

        if (paidAgain) {
          return {
            duplicate: true,
            orderId: paidAgain.orderId,
          };
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
            guestEmail: session.guestEmail,

            // Transfer the original session token hash.
            // Do not generate a different token here.
            guestAccessTokenHash: session.guestAccessTokenHash,
            guestAccessExpiresAt: session.guestAccessExpiresAt,
            guestAccessRevokedAt: session.guestAccessRevokedAt,
            whatsappConsent: session.whatsappConsent,
            whatsappConsentAt: session.whatsappConsentAt,

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
            productId: line.productId,
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

        if (session.userId && session.saveShippingAddress) {
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
        }

        if (session.userId && session.mode !== "BUY_NOW") {
          await cartService.clearCartInTransaction(tx, session.userId);
        }

        await tx.checkoutSession.update({
          where: { id: session.id },
          data: {
            status: "COMPLETED",
            orderId: order.id,
          },
        });

        for (const line of session.items) {
          await tx.product.update({
            where: { id: line.productId },
            data: {
              purchaseCount: { increment: line.quantity },
            },
          });
        }

        return {
          duplicate: false,
          order,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      },
    );

    if (result.duplicate) {
      logDuplicatePayment({
        razorpayPaymentId,
        razorpayOrderId,
        webhookEventId,
        orderId: result.orderId,
      });

      await queueGuestOrderNotifications(session, result.orderId, guestAccessToken);

      return {
        ok: true,
        duplicate: true,
        orderId: result.orderId,
        guestAccessToken: session.userId ? null : guestAccessToken,
      };
    }

    if (session.userId && session.mode !== "BUY_NOW") {
      await cartService.invalidateCartCache(session.userId);
    }

    logWebhook("FULFILLED", {
      razorpayPaymentId,
      razorpayOrderId,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      webhookEventId,
    });

    await queueGuestOrderNotifications(session, result.order.id, guestAccessToken);

    return {
      ok: true,
      duplicate: false,
      orderId: result.order.id,
      orderNumber: result.order.orderNumber,
      guestAccessToken: session.userId ? null : guestAccessToken,
    };
  } catch (error) {
    if (
      error instanceof InsufficientStockError ||
      error instanceof PaymentAmountMismatchError
    ) {
      throw error;
    }

    if (error.code === "P2002") {
      const duplicate = await findProcessedPayment(razorpayPaymentId);

      if (duplicate) {
        if (
          expectedUserId &&
          duplicate.order?.userId !== expectedUserId
        ) {
          throw new Error("Payment does not belong to this user");
        }

        logDuplicatePayment({
          razorpayPaymentId,
          razorpayOrderId,
          webhookEventId,
          orderId: duplicate.orderId,
          orderNumber: duplicate.order?.orderNumber,
        });

        await queueGuestOrderNotifications(session, duplicate.orderId, guestAccessToken);

        return {
          ok: true,
          duplicate: true,
          orderId: duplicate.orderId,
          orderNumber: duplicate.order?.orderNumber,
          guestAccessToken: session.userId ? null : guestAccessToken,
        };
      }
    }

    throw error;
  } finally {
    await Promise.all(redisLocks.map(releaseLock));
  }
}

export async function markSessionFailed(razorpayOrderId) {
  await prisma.checkoutSession.updateMany({
    where: {
      razorpayOrderId,
      status: "PENDING",
    },
    data: {
      status: "FAILED",
    },
  });
}
