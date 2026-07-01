import Razorpay from "razorpay";
import crypto from "crypto";
function getClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const razorpayService = {
  getKeyId() {
    return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  },

  async createRazorpayOrder({ amountPaise, receipt, notes = {} }) {
    const client = getClient();
    return client.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    });
  },

  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("RAZORPAY_KEY_SECRET missing");

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expected === signature;
  },

  verifyWebhookSignature(rawBody, signature) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET missing");

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return expected === signature;
  },
};
