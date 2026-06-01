import { prisma } from "@/lib/db";
import { calculateShipping, toPaise } from "@/lib/shipping";
import { notDeleted } from "@/lib/prisma-helpers";
import { cartService } from "@/services/cart-service";
import { razorpayService } from "@/services/payment/razorpay-service";
import { productInclude } from "@/lib/product-include";

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Read-only stock validation — does NOT reserve or decrement inventory.
 */
export async function validateCartStock(userId) {
  const cartItems = await cartService.getCartItemsForClient(userId);
  if (!cartItems.length) {
    throw new Error("Cart is empty");
  }

  const errors = [];

  for (const item of cartItems) {
    const variant = await prisma.productVariant.findFirst({
      where: {
        productId: item.productId,
        colorKey: item.color,
        size: Number(item.size),
        ...notDeleted,
        isActive: true,
      },
    });

    if (!variant) {
      errors.push(`${item.name}: variant unavailable`);
      continue;
    }

    if (variant.stock < item.quantity) {
      errors.push(
        `${item.name} (${item.color}/${item.size}): only ${variant.stock} left`,
      );
    }
  }

  if (errors.length) {
    throw new Error(errors.join("; "));
  }

  return cartItems;
}

async function buildSessionLineItems(cartItems) {
  const lines = [];

  for (const item of cartItems) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, ...notDeleted },
      include: productInclude,
    });
    if (!product) throw new Error(`Product unavailable: ${item.name}`);

    const variant = await prisma.productVariant.findFirst({
      where: {
        productId: item.productId,
        colorKey: item.color,
        size: Number(item.size),
        ...notDeleted,
      },
    });

    if (!variant) throw new Error(`Variant unavailable for ${item.name}`);

    const primaryImage =
      product.images.find((i) => !i.isHover)?.url ?? product.images[0]?.url ?? "";

    lines.push({
      productId: item.productId,
      variantId: variant.id,
      productName: product.name,
      productImage: primaryImage,
      productSku: variant.sku,
      color: item.color,
      size: Number(item.size),
      quantity: item.quantity,
      priceAtPurchase: variant.price ?? product.price,
    });
  }

  return lines;
}

export const checkoutService = {
  validateCartStock,
  buildSessionLineItems,

  /**
   * Creates CheckoutSession + Razorpay order only.
   * No Order row, no stock decrement.
   */
  async createPaymentSession(userId, address) {
    const cartItems = await validateCartStock(userId);
    const lines = await buildSessionLineItems(cartItems);

    const subtotal = lines.reduce(
      (s, l) => s + l.priceAtPurchase * l.quantity,
      0,
    );
    const shippingCost = calculateShipping(subtotal);
    const total = subtotal + shippingCost;

    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    const session = await prisma.checkoutSession.create({
      data: {
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
        expiresAt,
        items: { create: lines },
      },
      include: { items: true },
    });

    const razorpayOrder = await razorpayService.createRazorpayOrder({
      amountPaise: toPaise(total),
      receipt: session.id,
      notes: { checkoutSessionId: session.id, userId },
    });

    await prisma.checkoutSession.update({
      where: { id: session.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    return {
      sessionId: session.id,
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
  },
};
