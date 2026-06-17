"use server";

import { checkoutService } from "@/services/checkout-service";
import {
  addressService,
  toCheckoutAddress,
} from "@/services/address-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { requireDbUser } from "@/lib/require-db-user";

async function resolveShippingAddress(userId, { addressId, ...manual }) {
  if (addressId) {
    const saved = await addressService.getByIdForUser(userId, addressId);
    if (!saved) throw new Error("Saved address not found");
    return toCheckoutAddress(saved);
  }

  if (!manual.fullName || !manual.phone || !manual.line1 || !manual.city) {
    throw new Error("Complete shipping address required");
  }

  return {
    fullName: manual.fullName,
    phone: manual.phone,
    line1: manual.line1,
    line2: manual.line2 || null,
    city: manual.city,
    state: manual.state || "",
    country: manual.country || "India",
    pincode: manual.pincode,
  };
}

export async function createBuyNowCheckoutSessionAction(input) {
  const user = await requireDbUser();

  try {
    await assertRateLimit({ prefix: "checkout-buy-now", limit: 8, windowMs: 60_000 });
    const shipping = await resolveShippingAddress(user.id, input);
    const { productId, color, size, quantity = 1, paymentMethod = "razorpay" } = input;

    if (!productId || !color || !size) {
      return { ok: false, error: "Missing product selection" };
    }

    if (paymentMethod === "cod") {
      const order = await checkoutService.createBuyNowOrder(
        user.id,
        { ...shipping, email: user.email },
        { productId, color, size, quantity: Number(quantity) || 1 },
      );
      return { ok: true, orderId: order.id };
    }

    const session = await checkoutService.createBuyNowPaymentSession(
      user.id,
      { ...shipping, email: user.email },
      { productId, color, size, quantity: Number(quantity) || 1 },
    );
    return { ok: true, ...session };
  } catch (err) {
    return { ok: false, error: err.message || "Checkout failed" };
  }
}

export async function createCheckoutSessionAction(input) {
  const user = await requireDbUser();

  try {
    await assertRateLimit({ prefix: "checkout", limit: 8, windowMs: 60_000 });
    const shipping = await resolveShippingAddress(user.id, input);
    const session = await checkoutService.createPaymentSession(user.id, {
      ...shipping,
      email: user.email,
    });
    return { ok: true, ...session };
  } catch (err) {
    return { ok: false, error: err.message || "Checkout failed" };
  }
}
