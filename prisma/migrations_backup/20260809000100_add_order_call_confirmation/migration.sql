ALTER TABLE "Order"
ADD COLUMN "confirmedByCall" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "confirmedAt" TIMESTAMP(3);

CREATE INDEX "Order_confirmedByCall_status_idx"
ON "Order"("confirmedByCall", "status");
