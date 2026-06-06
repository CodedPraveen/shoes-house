import { prisma } from "@/lib/db";

/** Admin / debugging — variant stock history from InventoryMovement. */
export const inventoryReadService = {
  async getMovementsByVariant(variantId, limit = 50) {
    return prisma.inventoryMovement.findMany({
      where: { variantId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        order: { select: { orderNumber: true, id: true } },
        variant: { select: { sku: true } },
      },
    });
  },

  async getMovementsByOrder(orderId) {
    return prisma.inventoryMovement.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: { variant: { select: { sku: true } } },
    });
  },
};
