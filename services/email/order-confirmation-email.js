import { getResendClient } from "@/services/email/resend-client";
import { buildOrderConfirmationEmail } from "@/emails/order-confirmation";

export async function sendOrderConfirmationEmail({ order, accessUrl, idempotencyKey }) {
  const recipient = order.guestEmail;
  const from = process.env.EMAIL_FROM;
  if (!recipient) throw new Error("Guest order has no email recipient");
  if (!from) throw new Error("EMAIL_FROM is not configured");
  if (!idempotencyKey) throw new Error("Email idempotency key is required");

  const resend = await getResendClient();
  const message = buildOrderConfirmationEmail({ order, accessUrl });
  const { data, error } = await resend.emails.send({
    from,
    to: [recipient],
    subject: message.subject,
    html: message.html,
    headers: { "X-Entity-Ref-ID": idempotencyKey },
  }, { idempotencyKey });
  if (error) throw new Error(error.message || "Resend rejected the message");
  return { providerId: data?.id ?? null };
}
