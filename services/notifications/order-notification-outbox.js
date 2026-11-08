import { encryptNotificationToken } from "./notification-token-crypto.js";
import { normalizeIndianPhone } from "./phone.js";

export function buildGuestOrderUrl(orderId, token) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  const url = new URL(`/orders/${encodeURIComponent(orderId)}`, appUrl);
  url.searchParams.set("status", "confirmed");
  url.searchParams.set("token", token);
  return url.toString();
}

export async function createOrderNotificationOutboxes(tx, {
  order,
  rawGuestToken = null,
  encryptedGuestToken = null,
}) {
  if (!order.guestEmail || (!rawGuestToken && !encryptedGuestToken)) return;
  const accessTokenCiphertext = encryptedGuestToken || encryptNotificationToken(rawGuestToken);

  await tx.orderEmailOutbox.upsert({
    where: { orderId: order.id },
    update: {},
    create: {
      orderId: order.id,
      recipient: order.guestEmail,
      idempotencyKey: `order-confirmation:${order.id}`,
      accessTokenCiphertext,
    },
  });

  const phone = order.whatsappConsent ? normalizeIndianPhone(order.shipPhone) : null;
  if (phone) {
    await tx.orderWhatsAppOutbox.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        recipient: phone,
        template: process.env.WHATSAPP_ORDER_TEMPLATE_NAME || "order_confirmation",
        idempotencyKey: `whatsapp-order-confirmation:${order.id}`,
        accessTokenCiphertext,
      },
    });
  }

  await tx.order.update({
    where: { id: order.id },
    data: {
      emailDeliveryStatus: "QUEUED",
      whatsappDeliveryStatus: phone ? "QUEUED" : "SKIPPED",
    },
  });
}
