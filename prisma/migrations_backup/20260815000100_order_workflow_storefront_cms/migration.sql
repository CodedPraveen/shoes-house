-- Additive, production-safe order workflow states. Existing enum values and rows are preserved.
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_TO_SEND';

-- Persist explicit customer consent across asynchronous Razorpay fulfillment.
ALTER TABLE "CheckoutSession"
ADD COLUMN "saveShippingAddress" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "StorefrontTargetType" AS ENUM ('COLLECTION', 'CATEGORY', 'PRODUCT', 'CUSTOM');

CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "previousStatus" "OrderStatus",
    "newStatus" "OrderStatus" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedByUserId" TEXT,
    "actorType" TEXT NOT NULL DEFAULT 'ADMIN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "resourceType" TEXT NOT NULL DEFAULT 'image',
    "folder" TEXT NOT NULL,
    "alt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StorefrontSection" (
    "id" TEXT NOT NULL,
    "collection" "ProductCollection" NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StorefrontSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StorefrontSectionItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT,
    "productId" TEXT,
    "mediaAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StorefrontSectionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "collection" "ProductCollection" NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "targetType" "StorefrontTargetType" NOT NULL DEFAULT 'COLLECTION',
    "categoryId" TEXT,
    "productId" TEXT,
    "customHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NavbarItem" (
    "id" TEXT NOT NULL,
    "collection" "ProductCollection" NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "targetType" "StorefrontTargetType" NOT NULL,
    "categoryId" TEXT,
    "productId" TEXT,
    "customHref" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NavbarItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaAsset_publicId_key" ON "MediaAsset"("publicId");
CREATE INDEX "MediaAsset_folder_idx" ON "MediaAsset"("folder");
CREATE UNIQUE INDEX "StorefrontSection_collection_key_key" ON "StorefrontSection"("collection", "key");
CREATE INDEX "StorefrontSection_collection_enabled_sortOrder_idx" ON "StorefrontSection"("collection", "enabled", "sortOrder");
CREATE INDEX "StorefrontSectionItem_sectionId_enabled_sortOrder_idx" ON "StorefrontSectionItem"("sectionId", "enabled", "sortOrder");
CREATE INDEX "StorefrontSectionItem_categoryId_idx" ON "StorefrontSectionItem"("categoryId");
CREATE INDEX "StorefrontSectionItem_productId_idx" ON "StorefrontSectionItem"("productId");
CREATE INDEX "HeroSlide_collection_enabled_sortOrder_idx" ON "HeroSlide"("collection", "enabled", "sortOrder");
CREATE INDEX "NavbarItem_collection_enabled_sortOrder_idx" ON "NavbarItem"("collection", "enabled", "sortOrder");
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");
CREATE INDEX "OrderStatusHistory_changedBy_idx" ON "OrderStatusHistory"("changedBy");

ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StorefrontSectionItem" ADD CONSTRAINT "StorefrontSectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "StorefrontSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StorefrontSectionItem" ADD CONSTRAINT "StorefrontSectionItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StorefrontSectionItem" ADD CONSTRAINT "StorefrontSectionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StorefrontSectionItem" ADD CONSTRAINT "StorefrontSectionItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NavbarItem" ADD CONSTRAINT "NavbarItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NavbarItem" ADD CONSTRAINT "NavbarItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserve the currently deployed shoe hero slides as managed configuration.
INSERT INTO "MediaAsset" ("id", "url", "folder", "alt", "updatedAt") VALUES
('legacy-shoe-hero-1', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548727/WhatsApp_Image_2026-08-07_at_11.01.54_AM.jpg', 'legacy', 'Hero banner 1', CURRENT_TIMESTAMP),
('legacy-shoe-hero-2', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548890/WhatsApp_Image_2026-08-07_at_11.01.55_AM.jpg', 'legacy', 'Hero banner 2', CURRENT_TIMESTAMP),
('legacy-shoe-hero-3', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786549156/9b4f883c-b625-4369-889d-500e17a1b8fd.png', 'legacy', 'Hero banner 3', CURRENT_TIMESTAMP),
('legacy-shoe-hero-4', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550507/288e7ec9-070a-4bc9-b337-1b1789dc7c2b.jpg', 'legacy', 'Hero campaign 4', CURRENT_TIMESTAMP),
('legacy-shoe-hero-5', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550529/8fc723d9-fbb1-4751-b82d-05dfbedddfb4.jpg', 'legacy', 'Hero campaign 5', CURRENT_TIMESTAMP),
('legacy-shoe-hero-6', 'https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550532/3ecff149-a5eb-4f8a-b6a3-05d92e300fb5.jpg', 'legacy', 'Hero campaign 6', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "HeroSlide" ("id", "collection", "mediaAssetId", "alt", "enabled", "sortOrder", "targetType", "customHref", "updatedAt") VALUES
('legacy-shoe-slide-1', 'SHOES', 'legacy-shoe-hero-1', 'Hero banner 1', true, 0, 'CUSTOM', '/shoes/shoes-1', CURRENT_TIMESTAMP),
('legacy-shoe-slide-2', 'SHOES', 'legacy-shoe-hero-2', 'Hero banner 2', true, 1, 'CUSTOM', '/shoes/shoes-1-1.png', CURRENT_TIMESTAMP),
('legacy-shoe-slide-3', 'SHOES', 'legacy-shoe-hero-3', 'Hero banner 3', true, 2, 'CUSTOM', '/shoes/shoes-1-2.png', CURRENT_TIMESTAMP),
('legacy-shoe-slide-4', 'SHOES', 'legacy-shoe-hero-4', 'Hero campaign 4', true, 3, 'COLLECTION', NULL, CURRENT_TIMESTAMP),
('legacy-shoe-slide-5', 'SHOES', 'legacy-shoe-hero-5', 'Hero campaign 5', true, 4, 'COLLECTION', NULL, CURRENT_TIMESTAMP),
('legacy-shoe-slide-6', 'SHOES', 'legacy-shoe-hero-6', 'Hero campaign 6', true, 5, 'COLLECTION', NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
