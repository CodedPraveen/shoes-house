import { PaymentAmountMismatchError } from "../../lib/inventory-errors.js";

export function validateRazorpayPaymentState(payment, expectedOrderId) {
  if (payment?.order_id !== expectedOrderId) {
    return { ok: false, error: "Payment does not match this checkout." };
  }
  if (String(payment?.currency || "").toUpperCase() !== "INR") {
    return { ok: false, error: "Payment currency does not match this checkout." };
  }
  if (payment?.status !== "captured" && payment?.captured !== true) {
    return { ok: false, pending: true, error: "Payment is still being confirmed." };
  }
  return { ok: true };
}

export function assertPaymentMatchesCheckout({
  amountPaise,
  currency,
  expectedTotal,
  expectedCurrency = "INR",
}) {
  const receivedPaise = Number(amountPaise);
  const expectedPaise = expectedTotal * 100;
  if (
    !Number.isInteger(receivedPaise) ||
    receivedPaise !== expectedPaise ||
    String(currency || "").toUpperCase() !== expectedCurrency
  ) {
    throw new PaymentAmountMismatchError("Payment amount or currency mismatch", {
      expectedPaise,
      receivedPaise,
      expectedCurrency,
      receivedCurrency: currency,
    });
  }
}
