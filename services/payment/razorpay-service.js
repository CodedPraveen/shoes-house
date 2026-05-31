/**
 * Razorpay payment service — integrate when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are set.
 */

export const razorpayService = {
  async createOrder({ amount, currency = "INR", receipt }) {
    throw new Error(
      "Razorpay not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  },

  async verifyPayment() {
    throw new Error("Payment verification not implemented.");
  },
};
