/**
 * Structured webhook logging for production debugging (Vercel logs / observability).
 */
export function logWebhook(event, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    source: "razorpay-webhook",
    event,
    ...data,
  };

  if (event === "duplicate" || event === "error") {
    console.warn("[webhook]", JSON.stringify(entry));
  } else {
    console.info("[webhook]", JSON.stringify(entry));
  }

  return entry;
}
