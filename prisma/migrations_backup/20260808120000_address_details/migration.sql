-- Preserve a user-friendly saved-address label and keep an optional
-- house/building/landmark separate from the map-derived Address 1.
ALTER TABLE "Address"
ADD COLUMN "label" TEXT NOT NULL DEFAULT 'Home',
ADD COLUMN "landmark" TEXT;

ALTER TABLE "CheckoutSession"
ADD COLUMN "shipAddressLabel" TEXT,
ADD COLUMN "shipLandmark" TEXT;

ALTER TABLE "Order"
ADD COLUMN "shipLandmark" TEXT;
