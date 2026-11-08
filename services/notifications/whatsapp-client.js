const DEFAULT_TIMEOUT_MS = 5000;

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_API_VERSION &&
    process.env.WHATSAPP_ORDER_TEMPLATE_NAME
  );
}

export async function sendWhatsAppOrderConfirmation({ order, recipient, accessUrl }) {
  if (!isWhatsAppConfigured()) return { skipped: true };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const version = process.env.WHATSAPP_API_VERSION;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const response = await fetch(
      `https://graph.facebook.com/${encodeURIComponent(version)}/${encodeURIComponent(phoneNumberId)}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipient.replace(/^\+/, ""),
          type: "template",
          template: {
            name: process.env.WHATSAPP_ORDER_TEMPLATE_NAME,
            language: { code: process.env.WHATSAPP_ORDER_TEMPLATE_LANGUAGE || "en" },
            components: [{
              type: "body",
              parameters: [
                { type: "text", text: order.orderNumber },
                { type: "text", text: `INR ${Number(order.total).toLocaleString("en-IN")}` },
                { type: "text", text: order.payments?.some((payment) => payment.status === "PAID") ? "Razorpay" : "Cash on Delivery" },
                { type: "text", text: accessUrl },
              ],
            }],
          },
        }),
        signal: controller.signal,
      },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Meta WhatsApp request failed (${response.status})`);
    return { providerId: payload.messages?.[0]?.id ?? null };
  } finally {
    clearTimeout(timeout);
  }
}
