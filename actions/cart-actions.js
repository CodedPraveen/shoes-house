"use server";

import { requireDbUser } from "@/lib/require-db-user";
import { assertRateLimit } from "@/lib/rate-limit";
import { withPerf } from "@/lib/perf";
import { cartService } from "@/services/cart-service";
import { isClerkIdentityConflict } from "@/services/user-service";

async function getOptionalDbUser() {
  try {
    return await requireDbUser({ throwIfMissing: false });
  } catch (error) {
    // A conflicting identity has no safe database-cart owner; retain guest cart behavior.
    if (isClerkIdentityConflict(error)) return null;
    throw error;
  }
}

export async function getCartAction() {
  const user = await getOptionalDbUser();

  if (!user) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  return withPerf("cart.get", () =>
    cartService.getCartSummary(user.id),
  );
}

export async function addToCartAction({
  productId,
  size,
  quantity = 1,
}) {
  await assertRateLimit({
    prefix: "cart",
    limit: 60,
    windowMs: 60_000,
  });

  const user = await getOptionalDbUser();

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return withPerf("cart.add", () =>
    cartService.addItem(user.id, {
      productId,
      size,
      quantity,
    }),
  );
}

// export async function updateCartQuantityAction(lineId, quantity) {
//   await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
//   const user = await requireDbUser();
//   return withPerf("cart.update", () =>
//     cartService.updateQuantity(user.id, lineId, quantity),
//   );
// }

export async function updateCartQuantityAction(
  lineId,
  quantity,
) {
  await assertRateLimit({
    prefix: "cart",
    limit: 60,
    windowMs: 60_000,
  });

  const user = await getOptionalDbUser();

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return withPerf("cart.update", () =>
    cartService.updateQuantity(
      user.id,
      lineId,
      quantity,
    ),
  );
}

// export async function removeFromCartAction(lineId) {
//   await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
//   const user = await requireDbUser();
//   return withPerf("cart.remove", () => cartService.removeItem(user.id, lineId));
// }

export async function removeFromCartAction(lineId) {
  await assertRateLimit({
    prefix: "cart",
    limit: 60,
    windowMs: 60_000,
  });

  const user = await getOptionalDbUser();

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return withPerf("cart.remove", () =>
    cartService.removeItem(user.id, lineId),
  );
}

// export async function clearCartAction() {
//   const user = await requireDbUser();
//   return withPerf("cart.clear", () => cartService.clearCart(user.id));
// }

export async function clearCartAction() {
  const user = await getOptionalDbUser();

  if (!user) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
    };
  }

  return withPerf("cart.clear", () =>
    cartService.clearCart(user.id),
  );
}
