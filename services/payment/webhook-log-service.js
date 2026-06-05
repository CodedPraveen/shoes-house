import { prisma } from "@/lib/db";
import { logWebhook } from "@/lib/webhook-logger";

/**
 * Persist webhook outcomes for audits and production monitoring.
 */
export async function logWebhookEvent({
  status,
  eventId = null,
  eventType = null,
  razorpayPaymentId = null,
  razorpayOrderId = null,
  payload = null,
}) {
  const resolvedEventId =
    eventId ?? `internal-${status.toLowerCase()}-${Date.now()}`;

  logWebhook(status, {
    webhookEventId: resolvedEventId,
    eventType,
    razorpayPaymentId,
    razorpayOrderId,
  });

  try {
    return await prisma.webhookEvent.create({
      data: {
        eventId: resolvedEventId,
        eventType: eventType ?? status,
        razorpayPaymentId,
        razorpayOrderId,
        status,
        payload: payload ?? {},
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      logWebhook("DUPLICATE_EVENT", {
        reason: "webhook_log_event_id_collision",
        eventId: resolvedEventId,
      });
      return null;
    }
    throw err;
  }
}

export async function findWebhookEventByEventId(eventId) {
  if (!eventId) return null;
  return prisma.webhookEvent.findUnique({ where: { eventId } });
}
