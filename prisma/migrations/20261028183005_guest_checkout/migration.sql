/*
  Warnings:

  - The `emailDeliveryStatus` column on the `CheckoutSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `emailDeliveryStatus` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('NOT_QUEUED', 'QUEUED', 'SENDING', 'SENT', 'FAILED');

-- DropForeignKey
ALTER TABLE "CheckoutSession" DROP CONSTRAINT "CheckoutSession_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "CheckoutSession" DROP COLUMN "emailDeliveryStatus",
ADD COLUMN     "emailDeliveryStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'NOT_QUEUED';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "emailDeliveryStatus",
ADD COLUMN     "emailDeliveryStatus" "EmailDeliveryStatus" NOT NULL DEFAULT 'NOT_QUEUED';

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
