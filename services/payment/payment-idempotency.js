import { prisma } from "@/lib/db";
import { logWebhook } from "@/lib/webhook-logger";

/**
 * Returns existing PAID payment if this Razorpay payment was already fulfilled.
 */
export async function findProcessedPayment(razorpayPaymentId) {
  if (!razorpayPaymentId) return null;

  return prisma.payment.findFirst({
    where: {
      razorpayPaymentId,
      status: "PAID",
      deletedAt: null,
    },
    include: { order: { select: { id: true, orderNumber: true, userId: true } } },
  });
}

export function logDuplicatePayment({
  razorpayPaymentId,
  razorpayOrderId,
  webhookEventId,
  orderId,
  orderNumber,
}) {
  logWebhook("DUPLICATE_EVENT", {
    reason: "payment_already_processed",
    razorpayPaymentId,
    razorpayOrderId,
    webhookEventId,
    orderId,
    orderNumber,
  });
}
