import { prisma } from "../../lib/db.js";
import { sendOrderConfirmationEmail } from "../email/order-confirmation-email.js";
import { decryptNotificationToken } from "./notification-token-crypto.js";
import { buildGuestOrderUrl } from "./order-notification-outbox.js";
import { isWhatsAppConfigured, sendWhatsAppOrderConfirmation } from "./whatsapp-client.js";

const MAX_ATTEMPTS = 5;
const STALE_SENDING_MS = 10 * 60_000;

function claimableWhere(now = new Date()) {
  return {
    attempts: { lt: MAX_ATTEMPTS },
    OR: [
      { status: { in: ["PENDING", "FAILED"] }, nextAttemptAt: { lte: now } },
      { status: "SENDING", updatedAt: { lte: new Date(now.getTime() - STALE_SENDING_MS) } },
    ],
  };
}

function nextAttempt(attempts) {
  return new Date(Date.now() + Math.min(60, 2 ** attempts) * 60_000);
}

async function loadOrder(orderId) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payments: { where: { deletedAt: null } } },
  });
}

async function processEmail(row) {
  const claimed = await prisma.orderEmailOutbox.updateMany({
    where: { id: row.id, ...claimableWhere() },
    data: { status: "SENDING", attempts: { increment: 1 } },
  });
  if (!claimed.count) return;
  try {
    const order = await loadOrder(row.orderId);
    if (!order) throw new Error("Order no longer exists");
    const token = decryptNotificationToken(row.accessTokenCiphertext);
    const result = await sendOrderConfirmationEmail({
      order,
      accessUrl: buildGuestOrderUrl(order.id, token),
      idempotencyKey: row.idempotencyKey,
    });
    await prisma.$transaction([
      prisma.orderEmailOutbox.update({ where: { id: row.id }, data: { status: "SENT", sentAt: new Date(), lastError: null, providerId: result.providerId, accessTokenCiphertext: null } }),
      prisma.order.update({ where: { id: row.orderId }, data: { emailDeliveryStatus: "SENT" } }),
    ]);
  } catch (error) {
    const attempts = row.attempts + 1;
    await prisma.$transaction([
      prisma.orderEmailOutbox.update({ where: { id: row.id }, data: { status: "FAILED", lastError: String(error?.message || "Email delivery failed").slice(0, 500), nextAttemptAt: nextAttempt(attempts) } }),
      prisma.order.update({ where: { id: row.orderId }, data: { emailDeliveryStatus: "FAILED" } }),
    ]);
  }
}

async function processWhatsApp(row) {
  if (!isWhatsAppConfigured()) {
    await prisma.$transaction([
      prisma.orderWhatsAppOutbox.update({ where: { id: row.id }, data: { status: "SKIPPED", lastError: "WhatsApp is not configured", accessTokenCiphertext: null } }),
      prisma.order.update({ where: { id: row.orderId }, data: { whatsappDeliveryStatus: "SKIPPED" } }),
    ]);
    return;
  }
  const claimed = await prisma.orderWhatsAppOutbox.updateMany({
    where: { id: row.id, ...claimableWhere() },
    data: { status: "SENDING", attempts: { increment: 1 } },
  });
  if (!claimed.count) return;
  try {
    const order = await loadOrder(row.orderId);
    if (!order) throw new Error("Order no longer exists");
    const token = decryptNotificationToken(row.accessTokenCiphertext);
    const result = await sendWhatsAppOrderConfirmation({ order, recipient: row.recipient, accessUrl: buildGuestOrderUrl(order.id, token) });
    await prisma.$transaction([
      prisma.orderWhatsAppOutbox.update({ where: { id: row.id }, data: { status: result.skipped ? "SKIPPED" : "SENT", sentAt: result.skipped ? null : new Date(), lastError: null, providerId: result.providerId ?? null, accessTokenCiphertext: null } }),
      prisma.order.update({ where: { id: row.orderId }, data: { whatsappDeliveryStatus: result.skipped ? "SKIPPED" : "SENT" } }),
    ]);
  } catch (error) {
    const attempts = row.attempts + 1;
    await prisma.$transaction([
      prisma.orderWhatsAppOutbox.update({ where: { id: row.id }, data: { status: "FAILED", lastError: String(error?.message || "WhatsApp delivery failed").slice(0, 500), nextAttemptAt: nextAttempt(attempts) } }),
      prisma.order.update({ where: { id: row.orderId }, data: { whatsappDeliveryStatus: "FAILED" } }),
    ]);
  }
}

export async function processOrderNotifications({ orderId = null } = {}) {
  const due = { ...claimableWhere(), ...(orderId ? { orderId } : {}) };
  const [emails, whatsapp] = await Promise.all([
    prisma.orderEmailOutbox.findMany({ where: due, take: 25 }),
    prisma.orderWhatsAppOutbox.findMany({ where: due, take: 25 }),
  ]);
  await Promise.allSettled([
    ...emails.map(processEmail),
    ...whatsapp.map(processWhatsApp),
  ]);
  return { emails: emails.length, whatsapp: whatsapp.length };
}
