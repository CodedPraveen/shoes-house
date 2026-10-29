-- DRAFT migration. Verify real deployed schema first; adapt FK/index names.
-- This SQL only makes existing ownership nullable and adds guest/email columns.
-- It intentionally does not drop existing customer data or Clerk columns.

ALTER TABLE "CheckoutSession" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "CheckoutSession"
  ADD COLUMN "guestEmail" TEXT,
  ADD COLUMN "guestAccessTokenHash" TEXT,
  ADD COLUMN "guestAccessExpiresAt" TIMESTAMP(3),
  ADD COLUMN "guestAccessRevokedAt" TIMESTAMP(3),
  ADD COLUMN "emailDeliveryStatus" TEXT NOT NULL DEFAULT 'NOT_QUEUED';

ALTER TABLE "Order"
  ADD COLUMN "guestEmail" TEXT,
  ADD COLUMN "guestAccessTokenHash" TEXT,
  ADD COLUMN "guestAccessExpiresAt" TIMESTAMP(3),
  ADD COLUMN "guestAccessRevokedAt" TIMESTAMP(3),
  ADD COLUMN "emailDeliveryStatus" TEXT NOT NULL DEFAULT 'NOT_QUEUED';

CREATE UNIQUE INDEX "CheckoutSession_guestAccessTokenHash_key" ON "CheckoutSession"("guestAccessTokenHash");
CREATE UNIQUE INDEX "Order_guestAccessTokenHash_key" ON "Order"("guestAccessTokenHash");
CREATE INDEX "CheckoutSession_guestEmail_createdAt_idx" ON "CheckoutSession"("guestEmail", "createdAt");
CREATE INDEX "Order_guestEmail_createdAt_idx" ON "Order"("guestEmail", "createdAt");
CREATE INDEX "CheckoutSession_guestAccessExpiresAt_idx" ON "CheckoutSession"("guestAccessExpiresAt");
CREATE INDEX "Order_guestAccessExpiresAt_idx" ON "Order"("guestAccessExpiresAt");

-- Outbox table. Add Prisma relation + enum as documented in guest-checkout-schema.fragment.prisma.
CREATE TABLE "OrderEmailOutbox" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "template" TEXT NOT NULL DEFAULT 'ORDER_CONFIRMATION',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "lastError" TEXT,
  "providerId" TEXT,
  "idempotencyKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderEmailOutbox_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderEmailOutbox_orderId_key" UNIQUE ("orderId"),
  CONSTRAINT "OrderEmailOutbox_idempotencyKey_key" UNIQUE ("idempotencyKey")
);
CREATE INDEX "OrderEmailOutbox_status_nextAttemptAt_idx" ON "OrderEmailOutbox"("status", "nextAttemptAt");
CREATE INDEX "OrderEmailOutbox_recipient_createdAt_idx" ON "OrderEmailOutbox"("recipient", "createdAt");

-- Add the FK only after the corresponding Prisma relation is included:
ALTER TABLE "OrderEmailOutbox" ADD CONSTRAINT "OrderEmailOutbox_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
