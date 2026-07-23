import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import { cartInclude } from "@/lib/cart-include";
import { buildCartSummary } from "@/lib/cart-utils";

function mapCartItemRow(item) {
  const images = item.product.images || [];
  const primary =
    images.find((i) => !i.isHover)?.url ?? images[0]?.url ?? "";

  return {
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    image: primary,
    price: item.variant?.price ?? item.product.price,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    variantId: item.variantId,
  };
}

async function getCartId(userId) {
  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
  return cart.id;
}

export const cartService = {
  mapCartItemRow,
  buildCartSummary,

  async getCartSummary(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      return buildCartSummary([]);
    }

    const items = cart.items.map(mapCartItemRow);
    return buildCartSummary(items);
  },

  /** @deprecated Use getCartSummary — kept for fulfillment paths */
  async getCartItemsForClient(userId) {
    const { items } = await this.getCartSummary(userId);
    return items;
  },

  async addItem(userId, { productId, color, size, quantity = 1 }) {
    const cartId = await getCartId(userId);
    const sizeNum = Number(size);

    const [variant, existing] = await Promise.all([
      prisma.productVariant.findFirst({
        where: {
          productId,
          colorKey: color,
          size: sizeNum,
          ...notDeleted,
          isActive: true,
        },
        select: { id: true },
      }),
      prisma.cartItem.findFirst({
        where: {
          cartId,
          productId,
          color,
          size: sizeNum,
          ...notDeleted,
        },
        select: { id: true, quantity: true },
      }),
    ]);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          variantId: variant?.id ?? null,
          color,
          size: sizeNum,
          quantity,
        },
      });
    }

    return this.getCartSummary(userId);
  },

  async updateQuantity(userId, lineId, quantity) {
    if (quantity < 1) {
      await prisma.cartItem.updateMany({
        where: { id: lineId, cart: { userId }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: lineId, cart: { userId }, deletedAt: null },
        data: { quantity },
      });
    }
    return this.getCartSummary(userId);
  },

  async removeItem(userId, lineId) {
    await prisma.cartItem.updateMany({
      where: { id: lineId, cart: { userId }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return this.getCartSummary(userId);
  },

  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!cart) return buildCartSummary([]);

    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return buildCartSummary([]);
  },
};
