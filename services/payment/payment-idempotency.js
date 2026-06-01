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
    include: { order: { select: { id: true, orderNumber: true } } },
  });
}

export function logDuplicatePayment({
  razorpayPaymentId,
  razorpayOrderId,
  webhookEventId,
  orderId,
  orderNumber,
}) {
  logWebhook("duplicate", {
    reason: "payment_already_processed",
    razorpayPaymentId,
    razorpayOrderId,
    webhookEventId,
    orderId,
    orderNumber,
  });
}

/**
 * Razorpay may retry the same webhook event — dedupe by x-razorpay-event-id.
 */
export async function findWebhookEvent(eventId) {
  if (!eventId) return null;
  return prisma.webhookEvent.findUnique({ where: { eventId } });
}

export async function recordWebhookEvent({
  eventId,
  eventType,
  razorpayPaymentId,
  razorpayOrderId,
  status,
  payload,
}) {
  if (!eventId) return null;

  try {
    return await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        razorpayPaymentId: razorpayPaymentId ?? null,
        razorpayOrderId: razorpayOrderId ?? null,
        status,
        payload,
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      logWebhook("duplicate", {
        reason: "webhook_event_id_replay",
        eventId,
        eventType,
      });
      return findWebhookEvent(eventId);
    }
    throw err;
  }
}
