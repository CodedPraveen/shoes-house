CREATE TYPE "ProductProcessingStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

ALTER TABLE "Product"
ADD COLUMN "processingStatus" "ProductProcessingStatus" NOT NULL DEFAULT 'READY',
ADD COLUMN "processingError" TEXT,
ADD COLUMN "processingJobId" TEXT,
ADD COLUMN "processedAt" TIMESTAMP(3),
ADD COLUMN "pendingImageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "ProductImage" ADD COLUMN "publicId" TEXT;

CREATE INDEX "Product_processingStatus_idx" ON "Product"("processingStatus");
CREATE INDEX "ProductImage_publicId_idx" ON "ProductImage"("publicId");
