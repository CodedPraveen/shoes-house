import { razorpayService } from "@/services/payment/razorpay-service";
import {
  fulfillPaidCheckout,
  markSessionFailed,
} from "@/services/order-fulfillment-service";
import {
  findWebhookEvent,
  recordWebhookEvent,
} from "@/services/payment/payment-idempotency";
import { logWebhook } from "@/lib/webhook-logger";

export const webhookService = {
  async handleRazorpayEvent(rawBody, signature, webhookEventId = null) {
    if (!signature || !razorpayService.verifyWebhookSignature(rawBody, signature)) {
      return { ok: false, error: "Invalid webhook signature" };
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (webhookEventId) {
      const prior = await findWebhookEvent(webhookEventId);
      if (prior) {
        logWebhook("duplicate", {
          reason: "webhook_event_already_recorded",
          webhookEventId,
          eventType: prior.eventType,
          priorStatus: prior.status,
        });
        return {
          ok: true,
          duplicate: true,
          ignored: true,
          eventId: webhookEventId,
        };
      }
    }

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      if (!payment) {
        return { ok: false, error: "Missing payment entity" };
      }

      const result = await fulfillPaidCheckout({
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        amountPaise: payment.amount,
        fromWebhook: true,
        rawPayload: payload,
        webhookEventId,
      });

      if (webhookEventId) {
        await recordWebhookEvent({
          eventId: webhookEventId,
          eventType: event,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          status: result.duplicate ? "duplicate" : "processed",
          payload,
        });
      }

      return { ok: true, ...result };
    }

    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      if (payment?.order_id) {
        await markSessionFailed(payment.order_id);
      }

      if (webhookEventId) {
        await recordWebhookEvent({
          eventId: webhookEventId,
          eventType: event,
          razorpayPaymentId: payment?.id ?? null,
          razorpayOrderId: payment?.order_id ?? null,
          status: "processed",
          payload,
        });
      }

      return { ok: true, handled: "payment.failed" };
    }

    if (webhookEventId) {
      await recordWebhookEvent({
        eventId: webhookEventId,
        eventType: event,
        status: "ignored",
        payload,
      });
    }

    return { ok: true, ignored: event };
  },
};
