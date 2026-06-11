"use server";

import { auth } from "@clerk/nextjs/server";
import { checkoutService } from "@/services/checkout-service";
import { userService } from "@/services/user-service";
import {
  addressService,
  toCheckoutAddress,
} from "@/services/address-service";
import { assertRateLimit } from "@/lib/rate-limit";

async function requireDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  const user = await userService.getByClerkId(clerkId);
  if (!user) throw new Error("User not synced. Sign in again.");
  return user;
}

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
    const { productId, color, size, quantity = 1 } = input;

    if (!productId || !color || !size) {
      return { ok: false, error: "Missing product selection" };
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
