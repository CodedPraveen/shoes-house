async function postCheckout(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);
  if (!result || typeof result !== "object") {
    throw new Error("Checkout service returned an invalid response");
  }
  if (!response.ok && result.ok !== false) {
    throw new Error(result.error || "Checkout request failed");
  }
  return result;
}

export function createBuyNowCheckoutSessionRequest(payload) {
  return postCheckout("/api/checkout/buy-now/session", payload);
}

export function createCartCheckoutSessionRequest(payload) {
  return postCheckout("/api/checkout/session", payload);
}

export function verifyRazorpayPaymentRequest(payload) {
  return postCheckout("/api/checkout/razorpay/verify", payload);
}
