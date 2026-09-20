"use server";

import {
  createBuyNowCheckoutSession,
  createCartCheckoutSession,
  verifyRazorpayPayment,
} from "@/services/checkout-flow-service";

export async function createBuyNowCheckoutSessionAction(input) {
  return createBuyNowCheckoutSession(input);
}

export async function createCheckoutSessionAction(input) {
  return createCartCheckoutSession(input);
}

export async function verifyRazorpayPaymentAction(input) {
  return verifyRazorpayPayment(input);
}
