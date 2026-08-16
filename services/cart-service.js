import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import { cartInclude } from "@/lib/cart-include";
import { buildCartSummary } from "@/lib/cart-utils";
import { getCache, setCache, deleteCache } from "@/lib/redis/cache";

function mapCartItemRow(item) {
  const images = item.product.images || [];
  const primary =
    images.find((i) => !i.isHover)?.url ?? images[0]?.url ?? "";

  return {
    id: item.id,
    productId: item.product.id,
    name: item.product.name,
    image: primary,
    price: item.product.price,
    stock: item.product.stock,
    size: item.size,
    quantity: item.quantity,
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
    const key = `cart:${userId}`;

    const cached = await getCache(key);

    if (cached) {
      return cached;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    const summary = cart
      ? buildCartSummary(cart.items.map(mapCartItemRow))
      : buildCartSummary([]);

    await setCache(key, summary, 300);

    return summary;
  },

  /** @deprecated Use getCartSummary — kept for fulfillment paths */
  async getCartItemsForClient(userId) {
    const { items } = await this.getCartSummary(userId);
    return items;
  },

  async addItem(userId, { productId, size, quantity = 1 }) {
    const cartId = await getCartId(userId);
    const sizeNum = Number(size);
    const quantityNum = Number(quantity);

    if (
      !Number.isInteger(sizeNum) ||
      !Number.isInteger(quantityNum) ||
      quantityNum < 1
    ) {
      throw new Error("Invalid cart selection");
    }

    const [product, variant, existing] = await Promise.all([
      prisma.product.findFirst({
        where: {
          id: productId,
          ...notDeleted,
          sizes: { some: { size: sizeNum } },
        },
        select: { stock: true },
      }),
      prisma.productVariant.findFirst({
        where: {
          productId,
          size: sizeNum,
          ...notDeleted,
          isActive: true,
        },
        orderBy: [{ colorKey: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      }),
      prisma.cartItem.findFirst({
        where: {
          cartId,
          productId,
          size: sizeNum,
          ...notDeleted,
        },
        select: { id: true, quantity: true },
      }),
    ]);

    if (!product || !variant) {
      throw new Error("Selected size is unavailable");
    }

    const nextQuantity = (existing?.quantity ?? 0) + quantityNum;
    if (product.stock < nextQuantity) {
      throw new Error(`Only ${product.stock} left in stock`);
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity, variantId: variant.id, color: "" },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          variantId: variant?.id ?? null,
          color: "",
          size: sizeNum,
          quantity: quantityNum,
        },
      });
    }

    await deleteCache(`cart:${userId}`);

    return this.getCartSummary(userId);
  },

  async updateQuantity(userId, lineId, quantity) {
    const quantityNum = Number(quantity);
    if (!Number.isInteger(quantityNum)) {
      throw new Error("Invalid quantity");
    }

    if (quantityNum > 0) {
      const line = await prisma.cartItem.findFirst({
        where: { id: lineId, cart: { userId }, deletedAt: null },
        select: { product: { select: { stock: true } } },
      });
      if (!line) throw new Error("Cart item not found");
      if (line.product.stock < quantityNum) {
        throw new Error(`Only ${line.product.stock} left in stock`);
      }
    }

    if (quantityNum < 1) {
      await prisma.cartItem.updateMany({
        where: { id: lineId, cart: { userId }, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { id: lineId, cart: { userId }, deletedAt: null },
        data: { quantity: quantityNum },
      });
    }
    await deleteCache(`cart:${userId}`);

    return this.getCartSummary(userId);
  },

  async removeItem(userId, lineId) {
    await prisma.cartItem.updateMany({
      where: { id: lineId, cart: { userId }, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    await deleteCache(`cart:${userId}`);

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
    await deleteCache(`cart:${userId}`);

    return buildCartSummary([]);
  },

  async clearCartInTransaction(db, userId) {
    const cart = await db.cart.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!cart) return;

    await db.cartItem.updateMany({
      where: { cartId: cart.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },

  async invalidateCartCache(userId) {
    await deleteCache(`cart:${userId}`);
  },
};
