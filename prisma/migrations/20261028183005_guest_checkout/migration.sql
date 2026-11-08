-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('NOT_QUEUED', 'QUEUED', 'SENDING', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "CheckoutSession" DROP CONSTRAINT "CheckoutSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- Convert the draft text columns without dropping existing delivery state.
ALTER TABLE "CheckoutSession"
  ALTER COLUMN "emailDeliveryStatus" DROP DEFAULT,
  ALTER COLUMN "emailDeliveryStatus" TYPE "EmailDeliveryStatus"
    USING "emailDeliveryStatus"::"EmailDeliveryStatus",
  ALTER COLUMN "emailDeliveryStatus" SET DEFAULT 'NOT_QUEUED';

ALTER TABLE "Order"
  ALTER COLUMN "emailDeliveryStatus" DROP DEFAULT,
  ALTER COLUMN "emailDeliveryStatus" TYPE "EmailDeliveryStatus"
    USING "emailDeliveryStatus"::"EmailDeliveryStatus",
  ALTER COLUMN "emailDeliveryStatus" SET DEFAULT 'NOT_QUEUED';

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
