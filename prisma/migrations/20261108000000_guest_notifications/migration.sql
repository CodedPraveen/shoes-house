-- Add optional WhatsApp consent and durable notification delivery state.
CREATE TYPE "NotificationDeliveryStatus" AS ENUM (
  'NOT_QUEUED', 'QUEUED', 'SENDING', 'SENT', 'FAILED', 'SKIPPED'
);

ALTER TABLE "CheckoutSession"
  ADD COLUMN "whatsappConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "whatsappConsentAt" TIMESTAMP(3),
  ADD COLUMN "whatsappDeliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'NOT_QUEUED',
  ADD COLUMN "guestAccessTokenCiphertext" TEXT;

ALTER TABLE "Order"
  ADD COLUMN "whatsappConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "whatsappConsentAt" TIMESTAMP(3),
  ADD COLUMN "whatsappDeliveryStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'NOT_QUEUED';

ALTER TABLE "OrderEmailOutbox"
  ADD COLUMN "accessTokenCiphertext" TEXT;

CREATE TABLE "OrderWhatsAppOutbox" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "template" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "lastError" TEXT,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "accessTokenCiphertext" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderWhatsAppOutbox_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderWhatsAppOutbox_orderId_key" ON "OrderWhatsAppOutbox"("orderId");
CREATE UNIQUE INDEX "OrderWhatsAppOutbox_idempotencyKey_key" ON "OrderWhatsAppOutbox"("idempotencyKey");
CREATE INDEX "OrderWhatsAppOutbox_status_nextAttemptAt_idx" ON "OrderWhatsAppOutbox"("status", "nextAttemptAt");
CREATE INDEX "OrderWhatsAppOutbox_recipient_createdAt_idx" ON "OrderWhatsAppOutbox"("recipient", "createdAt");

ALTER TABLE "OrderWhatsAppOutbox" ADD CONSTRAINT "OrderWhatsAppOutbox_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
