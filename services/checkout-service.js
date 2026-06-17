import { prisma } from "@/lib/db";
import { calculateShipping, toPaise } from "@/lib/shipping";
import { notDeleted } from "@/lib/prisma-helpers";
import { cartService } from "@/services/cart-service";
import { razorpayService } from "@/services/payment/razorpay-service";
import { withPerf } from "@/lib/perf";

const SESSION_TTL_MS = 30 * 60 * 1000;

async function buildLineFromProductVariant(product, variant, color, size, quantity) {
  const images = product.images || [];
  const primary = images.find((i) => !i.isHover)?.url ?? images[0]?.url ?? "";

  return {
    productId: product.id,
    variantId: variant.id,
    productName: product.name,
    productImage: primary,
    productSku: variant.sku,
    color,
    size: Number(size),
    quantity,
    priceAtPurchase: variant.price ?? product.price,
  };
}

/** Batch-fetch products + variants — avoids N+1 per cart line */
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
        OR: cartItems.map((item) => ({
          productId: item.productId,
          colorKey: item.color,
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

    const variant = variants.find(
      (v) =>
        v.productId === item.productId &&
        v.colorKey === item.color &&
        v.size === Number(item.size),
    );
    if (!variant) throw new Error(`Variant unavailable for ${item.name}`);

    lines.push(
      await buildLineFromProductVariant(
        product,
        variant,
        item.color,
        item.size,
        item.quantity,
      ),
    );
  }

  return lines;
}

async function validateLinesStock(lines) {
  const variantIds = lines.map((l) => l.variantId).filter(Boolean);
  if (!variantIds.length) return;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, ...notDeleted, isActive: true },
    select: { id: true, stock: true, sku: true },
  });
  const stockMap = new Map(variants.map((v) => [v.id, v]));

  const errors = [];
  for (const line of lines) {
    const variant = stockMap.get(line.variantId);
    if (!variant) {
      errors.push(`${line.productName}: variant unavailable`);
      continue;
    }
    if (variant.stock < line.quantity) {
      errors.push(`${line.productName}: only ${variant.stock} left`);
    }
  }
  if (errors.length) throw new Error(errors.join("; "));
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
      shipFullName: address.fullName,
      shipPhone: address.phone,
      shipLine1: address.line1,
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
    if (!cartItems.length) throw new Error("Cart is empty");
    const lines = await buildSessionLineItems(cartItems);
    await validateLinesStock(lines);
    return { cartItems, lines };
  },

  async createPaymentSession(userId, address) {
    return withPerf("checkout.create.cart", async () => {
      const { lines } = await this.validateCartStock(userId);
      return createSessionWithRazorpay(userId, address, lines, "CART");
    });
  },

  /** Isolated Buy Now — never reads or mutates cart */
  async createBuyNowPaymentSession(
    userId,
    address,
    { productId, color, size, quantity = 1 },
  ) {
    return withPerf("checkout.create.buy_now", async () => {
      const [product, variant] = await Promise.all([
        prisma.product.findFirst({
          where: { id: productId, ...notDeleted },
          include: {
            images: {
              where: { deletedAt: null },
              orderBy: { sortOrder: "asc" },
              take: 2,
            },
          },
        }),
        prisma.productVariant.findFirst({
          where: {
            productId,
            colorKey: color,
            size: Number(size),
            ...notDeleted,
            isActive: true,
          },
        }),
      ]);

      if (!product) throw new Error("Product unavailable");
      if (!variant) throw new Error("Selected variant unavailable");
      if (variant.stock < quantity) {
        throw new Error(`Only ${variant.stock} left in stock`);
      }

      const line = await buildLineFromProductVariant(
        product,
        variant,
        color,
        size,
        quantity,
      );

      return createSessionWithRazorpay(userId, address, [line], "BUY_NOW");
    });
  },

  /** Create order directly for Cash on Delivery */
  async createBuyNowOrder(
    userId,
    address,
    { productId, color, size, quantity = 1 },
    paymentMethod = "cod",
  ) {
    return withPerf("checkout.create.buy_now.cod", async () => {
      const [product, variant] = await Promise.all([
        prisma.product.findFirst({
          where: { id: productId, ...notDeleted },
          include: {
            images: {
              where: { deletedAt: null },
              orderBy: { sortOrder: "asc" },
              take: 2,
            },
          },
        }),
        prisma.productVariant.findFirst({
          where: {
            productId,
            colorKey: color,
            size: Number(size),
            ...notDeleted,
            isActive: true,
          },
        }),
      ]);

      if (!product) throw new Error("Product unavailable");
      if (!variant) throw new Error("Selected variant unavailable");
      if (variant.stock < quantity) {
        throw new Error(`Only ${variant.stock} left in stock`);
      }

      const line = await buildLineFromProductVariant(
        product,
        variant,
        color,
        size,
        quantity,
      );

      const subtotal = line.priceAtPurchase * line.quantity;
      const shippingCost = calculateShipping(subtotal);
      const total = subtotal + shippingCost;

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const order = await prisma.order.create({
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
            },
          },
        },
        include: { items: true },
      });

      return order;
    });
  },
};
