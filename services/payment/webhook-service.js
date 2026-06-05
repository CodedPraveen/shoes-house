import { razorpayService } from "@/services/payment/razorpay-service";
import {
  fulfillPaidCheckout,
  markSessionFailed,
} from "@/services/order-fulfillment-service";
import {
  findWebhookEventByEventId,
  logWebhookEvent,
} from "@/services/payment/webhook-log-service";
import {
  findProcessedPayment,
} from "@/services/payment/payment-idempotency";
import {
  InsufficientStockError,
  PaymentAmountMismatchError,
} from "@/lib/inventory-errors";

function safeParsePayload(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return { raw: rawBody };
  }
}

export const webhookService = {
  async handleRazorpayEvent(rawBody, signature, webhookEventId = null) {
    const payload = safeParsePayload(rawBody);
    const event = payload.event ?? "unknown";

    if (!signature || !razorpayService.verifyWebhookSignature(rawBody, signature)) {
      await logWebhookEvent({
        status: "INVALID_SIGNATURE",
        eventId: webhookEventId,
        eventType: event,
        payload,
      });
      return { ok: false, error: "Invalid webhook signature", code: "INVALID_SIGNATURE" };
    }

    if (webhookEventId) {
      const prior = await findWebhookEventByEventId(webhookEventId);
      if (prior) {
        await logWebhookEvent({
          status: "DUPLICATE_EVENT",
          eventId: `${webhookEventId}-replay-${Date.now()}`,
          eventType: event,
          razorpayPaymentId: prior.razorpayPaymentId,
          razorpayOrderId: prior.razorpayOrderId,
          payload: { ...payload, priorStatus: prior.status },
        });
        return {
          ok: true,
          duplicate: true,
          ignored: true,
          eventId: webhookEventId,
          code: "DUPLICATE_EVENT",
        };
      }
    }

    if (event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      if (!payment) {
        return { ok: false, error: "Missing payment entity" };
      }

      const alreadyPaid = await findProcessedPayment(payment.id);
      if (alreadyPaid) {
        await logWebhookEvent({
          status: "DUPLICATE_EVENT",
          eventId: webhookEventId,
          eventType: event,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          payload,
        });
        return {
          ok: true,
          duplicate: true,
          orderId: alreadyPaid.orderId,
          code: "DUPLICATE_EVENT",
        };
      }

      try {
        const result = await fulfillPaidCheckout({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          amountPaise: payment.amount,
          fromWebhook: true,
          rawPayload: payload,
          webhookEventId,
        });

        await logWebhookEvent({
          status: result.duplicate ? "DUPLICATE_EVENT" : "FULFILLED",
          eventId: webhookEventId,
          eventType: event,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
          payload: {
            ...payload,
            fulfillment: {
              orderId: result.orderId,
              orderNumber: result.orderNumber,
              duplicate: Boolean(result.duplicate),
            },
          },
        });

        return { ok: true, ...result };
      } catch (err) {
        if (err instanceof PaymentAmountMismatchError) {
          await logWebhookEvent({
            status: "PAYMENT_AMOUNT_MISMATCH",
            eventId: webhookEventId,
            eventType: event,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            payload: { ...payload, error: err.message, meta: err.meta },
          });
          return { ok: false, error: err.message, code: "PAYMENT_AMOUNT_MISMATCH" };
        }

        if (err instanceof InsufficientStockError) {
          await logWebhookEvent({
            status: "OUT_OF_STOCK",
            eventId: webhookEventId,
            eventType: event,
            razorpayPaymentId: payment.id,
            razorpayOrderId: payment.order_id,
            payload: { ...payload, error: err.message, meta: err.meta },
          });
          return { ok: false, error: err.message, code: "OUT_OF_STOCK" };
        }

        throw err;
      }
    }

    if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      if (payment?.order_id) {
        await markSessionFailed(payment.order_id);
      }

      await logWebhookEvent({
        status: "PAYMENT_FAILED",
        eventId: webhookEventId,
        eventType: event,
        razorpayPaymentId: payment?.id ?? null,
        razorpayOrderId: payment?.order_id ?? null,
        payload,
      });

      return { ok: true, handled: "payment.failed" };
    }

    await logWebhookEvent({
      status: "IGNORED",
      eventId: webhookEventId,
      eventType: event,
      payload,
    });

    return { ok: true, ignored: event };
  },
};
