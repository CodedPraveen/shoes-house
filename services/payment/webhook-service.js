/**
 * Razorpay webhook handler — verify signature and update order status.
 */

export const webhookService = {
  async handleRazorpayEvent(payload, signature) {
    return {
      ok: false,
      message: "Webhook handler stub — implement signature verification.",
      payload,
      signature,
    };
  },
};
