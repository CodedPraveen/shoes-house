ALTER TABLE "Category"
ADD COLUMN "imageStoragePath" TEXT,
ADD COLUMN "imageWidth" INTEGER,
ADD COLUMN "imageHeight" INTEGER;

ALTER TABLE "ProductImage"
ALTER COLUMN "url" DROP NOT NULL,
ADD COLUMN "storagePath" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER;

ALTER TABLE "MediaAsset"
ALTER COLUMN "url" DROP NOT NULL,
ADD COLUMN "storagePath" TEXT,
ADD COLUMN "width" INTEGER,
ADD COLUMN "height" INTEGER;

CREATE INDEX "ProductImage_storagePath_idx" ON "ProductImage"("storagePath");
CREATE INDEX "MediaAsset_storagePath_idx" ON "MediaAsset"("storagePath");
