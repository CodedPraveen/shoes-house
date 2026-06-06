import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import { productInclude } from "@/lib/product-include";

export const wishlistService = {
  async getByUserId(userId) {
    return prisma.wishlist.findMany({
      where: { userId, ...notDeleted, product: notDeleted },
      include: { product: { include: productInclude } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductIds(userId) {
    const rows = await this.getByUserId(userId);
    return rows.map((r) => r.productId);
  },

  async add(userId, productId) {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId },
    });
    if (existing?.deletedAt) {
      return prisma.wishlist.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
    }
    if (existing) return existing;
    return prisma.wishlist.create({ data: { userId, productId } });
  },

  async remove(userId, productId) {
    return prisma.wishlist.updateMany({
      where: { userId, productId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },

  async toggle(userId, productId) {
    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId },
    });
    if (existing && !existing.deletedAt) {
      await this.remove(userId, productId);
      return false;
    }
    await this.add(userId, productId);
    return true;
  },
};
