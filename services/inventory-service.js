import { notDeleted } from "@/lib/prisma-helpers";
import { InsufficientStockError } from "@/lib/inventory-errors";

/**
 * Atomic product stock decrement + InventoryMovement (SALE).
 * quantity must be positive; movement is recorded as negative.
 */
export async function decrementStockForSale(
  tx,
  { productId, variantId, quantity, orderId, reason, sku },
) {
  if (quantity < 1) {
    throw new Error("Sale quantity must be at least 1");
  }

  const updated = await tx.product.updateMany({
    where: {
      id: productId,
      ...notDeleted,
      stock: { gte: quantity },
    },
    data: { stock: { decrement: quantity } },
  });

  if (updated.count !== 1) {
    throw new InsufficientStockError(
      sku ? `Insufficient stock for SKU ${sku}` : "Insufficient stock",
      { productId, variantId, quantity, sku },
    );
  }

  await tx.inventoryMovement.create({
    data: {
      variantId,
      quantity: -quantity,
      type: "SALE",
      reason: reason ?? "Order payment fulfilled",
      orderId: orderId ?? null,
    },
  });
}

/** Restore product-level stock while retaining the compatibility variant link. */
export async function incrementProductStock(
  tx,
  { productId, variantId, quantity, type, reason, orderId },
) {
  if (quantity < 1) {
    throw new Error("Increment quantity must be at least 1");
  }

  const updated = await tx.product.updateMany({
    where: { id: productId, ...notDeleted },
    data: { stock: { increment: quantity } },
  });
  if (updated.count !== 1) {
    throw new Error(`Product not found: ${productId}`);
  }

  await tx.inventoryMovement.create({
    data: {
      variantId,
      quantity,
      type,
      reason: reason ?? type,
      orderId: orderId ?? null,
    },
  });
}

/**
 * Legacy variant-level increase used by the unmigrated inventory admin.
 */
export async function incrementStock(
  tx,
  { variantId, quantity, type, reason, orderId },
) {
  if (quantity < 1) {
    throw new Error("Increment quantity must be at least 1");
  }

  const updated = await tx.productVariant.updateMany({
    where: { id: variantId, ...notDeleted },
    data: { stock: { increment: quantity } },
  });

  if (updated.count !== 1) {
    throw new Error(`Variant not found: ${variantId}`);
  }

  await tx.inventoryMovement.create({
    data: {
      variantId,
      quantity,
      type,
      reason: reason ?? type,
      orderId: orderId ?? null,
    },
  });
}

/**
 * Admin adjustment — positive or negative delta.
 */
export async function adjustStockAdmin(
  tx,
  { variantId, quantityDelta, reason, orderId },
) {
  if (quantityDelta === 0) return;

  if (quantityDelta < 0) {
    const qty = Math.abs(quantityDelta);
    const updated = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        ...notDeleted,
        stock: { gte: qty },
      },
      data: { stock: { decrement: qty } },
    });

    if (updated.count !== 1) {
      throw new InsufficientStockError("Insufficient stock for admin adjustment", {
        variantId,
        quantity: qty,
      });
    }

    await tx.inventoryMovement.create({
      data: {
        variantId,
        quantity: quantityDelta,
        type: "ADMIN_ADJUSTMENT",
        reason: reason ?? "Admin stock adjustment",
        orderId: orderId ?? null,
      },
    });
    return;
  }

  await incrementStock(tx, {
    variantId,
    quantity: quantityDelta,
    type: "ADMIN_ADJUSTMENT",
    reason: reason ?? "Admin stock adjustment",
    orderId,
  });
}
