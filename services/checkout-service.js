import { prisma } from "@/lib/db";
import { calculateShipping, toPaise } from "@/lib/shipping";
import { notDeleted } from "@/lib/prisma-helpers";
import { cartService } from "@/services/cart-service";
import { razorpayService } from "@/services/payment/razorpay-service";
import { withPerf } from "@/lib/perf";
import { acquireLock, releaseLock } from "@/lib/redis/lock";
import { saveShippingAddressForUser } from "@/services/address-service";
import { decrementStockForSale } from "@/services/inventory-service";

const SESSION_TTL_MS = 30 * 60 * 1000;

function buildLineFromProduct(product, variant, size, quantity) {
  const images = product.images || [];
  const primary =
    images.find((i) => !i.isHover)?.url ??
    images[0]?.url ??
    "";

  return {
    productId: product.id,
    variantId: variant.id,
    productName: product.name,
    productImage: primary,
    productSku: variant.sku,
    color: "",
    size: Number(size),
    quantity,
    priceAtPurchase: product.price,
  };
}

/** Batch-fetch products + compatibility variants — avoids N+1 per cart line. */
async function buildSessionLineItems(cartItems) {
  if (!cartItems.length) return [];

  const productIds = [...new Set(cartItems.map((i) => i.productId))];

  const [products, variants] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds }, ...notDeleted },
      include: {
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        productId: { in: productIds },
        ...notDeleted,
        isActive: true,
        OR: cartItems.map((item) => ({
          productId: item.productId,
          size: Number(item.size),
        })),
      },
    }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));

  const lines = [];
  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Product unavailable: ${item.name}`);

    const matchingVariants = variants.filter(
      (v) =>
        v.productId === item.productId &&
        v.size === Number(item.size),
    );
    const variant =
      matchingVariants.find((candidate) => candidate.colorKey === "") ??
      matchingVariants[0];
    if (!variant) throw new Error(`Variant unavailable for ${item.name}`);

    lines.push(
      buildLineFromProduct(
        product,
        variant,
        item.size,
        item.quantity,
      ),
    );
  }

  return lines;
}

async function validateLinesStock(lines) {
  const requestedByProduct = new Map();
  for (const line of lines) {
    requestedByProduct.set(
      line.productId,
      (requestedByProduct.get(line.productId) ?? 0) + line.quantity,
    );
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...requestedByProduct.keys()] }, ...notDeleted },
    select: { id: true, name: true, stock: true },
  });
  const stockMap = new Map(products.map((product) => [product.id, product]));

  const errors = [];
  for (const [productId, requested] of requestedByProduct) {
    const product = stockMap.get(productId);
    if (!product) {
      errors.push("Product unavailable");
      continue;
    }
    if (product.stock < requested) {
      errors.push(`${product.name}: only ${product.stock} left`);
    }
  }
  if (errors.length) throw new Error(errors.join("; "));
}

async function acquireProductLocks(productIds, ttl) {
  const locks = [];
  const uniqueIds = [...new Set(productIds)].sort();

  try {
    for (const productId of uniqueIds) {
      const key = `product:${productId}`;
      const ok = await acquireLock(key, ttl);
      if (!ok) throw new Error("Another checkout is already processing.");
      locks.push(key);
    }
    return locks;
  } catch (error) {
    await Promise.all(locks.map(releaseLock));
    throw error;
  }
}

async function getProductSelection(productId, size) {
  const sizeNumber = Number(size);
  const productQuery = prisma.product.findFirst({
    where: {
      id: productId,
      ...notDeleted,
      sizes: { some: { size: sizeNumber } },
    },
    include: {
      images: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        take: 2,
      },
    },
  });
  const compatibilityVariant = prisma.productVariant.findFirst({
    where: {
      productId,
      size: sizeNumber,
      ...notDeleted,
      isActive: true,
    },
    orderBy: [{ colorKey: "asc" }, { createdAt: "asc" }],
  });

  const [product, variant] = await Promise.all([
    productQuery,
    compatibilityVariant,
  ]);
  if (!product) throw new Error("Product or selected size unavailable");
  if (!variant) throw new Error("Selected size unavailable");

  return { product, variant };
}

async function createSessionWithRazorpay(userId, address, lines, mode) {
  const subtotal = lines.reduce((s, l) => s + l.priceAtPurchase * l.quantity, 0);
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost;
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const session = await prisma.checkoutSession.create({
    data: {
      userId,
      mode,
      subtotal,
      shippingCost,
      total,
      status: "PENDING",
      shipAddressLabel: address.label || "Home",
      shipFullName: address.fullName,
      shipPhone: address.phone,
      shipLine1: address.line1,
      shipLandmark: address.landmark || null,
      saveShippingAddress: Boolean(address.saveShippingAddress),
      shipLine2: address.line2 || null,
      shipCity: address.city,
      shipState: address.state,
      shipCountry: address.country || "India",
      shipPincode: address.pincode,
      expiresAt,
      items: { create: lines },
    },
    include: { items: true },
  });

  const razorpayOrder = await razorpayService.createRazorpayOrder({
    amountPaise: toPaise(total),
    receipt: session.id,
    notes: {
      checkoutSessionId: session.id,
      userId,
      mode,
    },
  });

  await prisma.checkoutSession.update({
    where: { id: session.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  return {
    sessionId: session.id,
    mode,
    razorpayOrderId: razorpayOrder.id,
    amount: total,
    currency: "INR",
    keyId: razorpayService.getKeyId(),
    user: {
      name: address.fullName,
      email: address.email,
      contact: address.phone,
    },
  };
}

export const checkoutService = {
  async validateCartStock(userId) {
    const cartItems = await cartService.getCartItemsForClient(userId);

    if (!cartItems.length) {
      throw new Error("Cart is empty");
    }

    let locks = [];
    try {
      locks = await acquireProductLocks(
        cartItems.map((item) => item.productId),
        15,
      );

      const lines = await buildSessionLineItems(cartItems);

      await validateLinesStock(lines);

      return { cartItems, lines, locks };
    } catch (err) {
      await Promise.all(locks.map(releaseLock));
      throw err;
    }
  },

  async createPaymentSession(userId, address) {
    return withPerf("checkout.create.cart", async () => {
      const { lines, locks } = await this.validateCartStock(userId);

      try {
        return await createSessionWithRazorpay(
          userId,
          address,
          lines,
          "CART",
        );
      } finally {
        await Promise.all(locks.map(releaseLock));
      }
    });
  },

  /** Isolated Buy Now — never reads or mutates cart */
  async createBuyNowPaymentSession(
    userId,
    address,
    { productId, size, quantity = 1 },
  ) {
    return withPerf("checkout.create.buy_now", async () => {
      const quantityNumber = Number(quantity);
      if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
        throw new Error("Invalid quantity");
      }
      const { product, variant } = await getProductSelection(productId, size);
      if (product.stock < quantityNumber) {
        throw new Error(`Only ${product.stock} left in stock`);
      }

      const line = buildLineFromProduct(
        product,
        variant,
        size,
        quantityNumber,
      );

      return createSessionWithRazorpay(userId, address, [line], "BUY_NOW");
    });
  },

  /** Create order directly for Cash on Delivery */
  async createBuyNowOrder(
    userId,
    address,
    { productId, size, quantity = 1 },
    paymentMethod = "cod",
  ) {
    return withPerf("checkout.create.buy_now.cod", async () => {
      const quantityNumber = Number(quantity);
      if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
        throw new Error("Invalid quantity");
      }
      const locks = await acquireProductLocks([productId], 30);

      try {
        const { product, variant } = await getProductSelection(productId, size);
        const line = buildLineFromProduct(
          product,
          variant,
          size,
          quantityNumber,
        );

        const subtotal = line.priceAtPurchase * line.quantity;
        const shippingCost = calculateShipping(subtotal);
        const total = subtotal + shippingCost;

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const order = await prisma.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              orderNumber,
              userId,
              subtotal,
              shippingCost,
              total,
              status: "PENDING",
              shipFullName: address.fullName,
              shipPhone: address.phone,
              shipLine1: address.line1,
              shipLandmark: address.landmark || null,
              shipLine2: address.line2 || null,
              shipCity: address.city,
              shipState: address.state,
              shipCountry: address.country || "India",
              shipPincode: address.pincode,
              items: { create: [line] },
              payments: {
                create: {
                  paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay",
                  status: "PENDING",
                  amount: total,
                  currency: "INR",
                },
              },
            },
            include: { items: true },
          });

          await decrementStockForSale(tx, {
            productId: line.productId,
            variantId: line.variantId,
            quantity: line.quantity,
            orderId: created.id,
            reason: `Sale · order ${created.orderNumber}`,
            sku: line.productSku,
          });
          await tx.product.update({
            where: { id: line.productId },
            data: { purchaseCount: { increment: line.quantity } },
          });

          if (address.saveShippingAddress) {
            await saveShippingAddressForUser(tx, userId, address);
          }
          return created;
        });

        return order;
      } finally {
        await Promise.all(locks.map(releaseLock));
      }
    });
  },
  async createCartOrder(
    userId,
    address,
    paymentMethod = "cod",
  ) {
    return withPerf("checkout.create.cart.cod", async () => {
      const { lines, locks } = await this.validateCartStock(userId);

      try {
        const subtotal = lines.reduce(
          (sum, line) => sum + line.priceAtPurchase * line.quantity,
          0,
        );

        const shippingCost = calculateShipping(subtotal);
        const total = subtotal + shippingCost;

        const orderNumber = `ORD-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

        const order = await prisma.$transaction(async (tx) => {
          const created = await tx.order.create({
            data: {
              orderNumber,
              userId,
              subtotal,
              shippingCost,
              total,

              status: "PENDING",

              shipFullName: address.fullName,
              shipPhone: address.phone,
              shipLine1: address.line1,
              shipLandmark: address.landmark || null,
              shipLine2: address.line2 || null,
              shipCity: address.city,
              shipState: address.state,
              shipCountry: address.country || "India",
              shipPincode: address.pincode,

              items: {
                create: lines,
              },

              payments: {
                create: {
                  paymentMethod: "Cash on Delivery",
                  status: "PENDING",
                  amount: total,
                  currency: "INR",
                },
              },
            },
            include: {
              items: true,
            },
          });

          for (const line of lines) {
            await decrementStockForSale(tx, {
              productId: line.productId,
              variantId: line.variantId,
              quantity: line.quantity,
              orderId: created.id,
              reason: `Sale · order ${created.orderNumber}`,
              sku: line.productSku,
            });

            await tx.product.update({
              where: { id: line.productId },
              data: {
                purchaseCount: {
                  increment: line.quantity,
                },
              },
            });
          }

          await cartService.clearCartInTransaction(tx, userId);

          return created;
        });

        // Save the address AFTER the order transaction.
        // Address saving must not keep the order transaction open.
        if (address.saveShippingAddress) {
          await saveShippingAddressForUser(prisma, userId, address);
        }

        await cartService.invalidateCartCache(userId);

        return order;
      } finally {
        await Promise.all(locks.map(releaseLock));
      }
    });
  },
};
