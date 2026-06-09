import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import { productInclude } from "@/lib/product-include";
import { mapProduct } from "@/lib/mappers/product-mapper";

export const cartService = {
  async getOrCreateCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          where: {
            deletedAt: null,
          },
          include: {
            product: {
              include: productInclude,
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: { include: productInclude },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  },

  async getCartItemsForClient(userId) {
    const cart = await this.getOrCreateCart(userId);
    return cart.items.map((item) => {
      const product = mapProduct(item.product);
      return {
        id: item.id,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: item.variant?.price ?? product.price,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        variantId: item.variantId,
      };
    });
  },

  // async addItem(userId, { productId, color, size, quantity = 1 }) {
  //   const cart = await this.getOrCreateCart(userId);

  //   const variant = await prisma.productVariant.findFirst({
  //     where: {
  //       productId,
  //       colorKey: color,
  //       size: Number(size),
  //       ...notDeleted,
  //       isActive: true,
  //     },
  //   });

  //   const existing = await prisma.cartItem.findFirst({
  //     where: {
  //       cartId: cart.id,
  //       productId,
  //       color,
  //       size: Number(size),
  //       ...notDeleted,
  //     },
  //   });

  //   if (existing) {
  //     return prisma.cartItem.update({
  //       where: { id: existing.id },
  //       data: { quantity: existing.quantity + quantity },
  //     });
  //   }

  //   return prisma.cartItem.create({
  //     data: {
  //       cartId: cart.id,
  //       productId,
  //       variantId: variant?.id ?? null,
  //       color,
  //       size: Number(size),
  //       quantity,
  //     },
  //   });
  // },
  async addItem(userId, data) {
    console.time("addItem");

    const cart = await this.getOrCreateCart(userId);
    console.timeLog("addItem", "getOrCreateCart");

    const variant = await prisma.productVariant.findFirst({
      where: {
        productId: data.productId,
        colorKey: data.color,
        size: Number(data.size),
        ...notDeleted,
        isActive: true,
      },
    });
    console.timeLog("addItem", "variant");

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        color: data.color,
        size: Number(data.size),
        ...notDeleted,
      },
    });
    console.timeLog("addItem", "existing");

    console.timeEnd("addItem");

    if (existing) {
      return prisma.cartItem.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: existing.quantity + (data.quantity || 1),
        },
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: variant?.id ?? null,
        color: data.color,
        size: Number(data.size),
        quantity: data.quantity || 1,
      },
    });
  },

  async updateQuantity(userId, lineId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    const item = await prisma.cartItem.findFirst({
      where: { id: lineId, cartId: cart.id, ...notDeleted },
    });
    if (!item) return null;
    if (quantity < 1) {
      return prisma.cartItem.update({
        where: { id: lineId },
        data: { deletedAt: new Date() },
      });
    }
    return prisma.cartItem.update({
      where: { id: lineId },
      data: { quantity },
    });
  },

  async removeItem(userId, lineId) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.updateMany({
      where: { id: lineId, cartId: cart.id },
      data: { deletedAt: new Date() },
    });
  },

  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);
    return prisma.cartItem.updateMany({
      where: { cartId: cart.id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  },
};
