"use server";

import { requireDbUser } from "@/lib/require-db-user";
import { assertRateLimit } from "@/lib/rate-limit";
import { withPerf } from "@/lib/perf";


// export async function getCartAction() {
//   const user = await requireDbUser();

//   if (!user?.id) {
//     return {
//       items: [],
//       itemCount: 0,
//       subtotal: 0,
//     };
//   }

//   return withPerf("cart.get", () =>
//     cartService.getCartSummary(user.id)
//   );
// }

export async function getCartAction() {
  const user = await requireDbUser({
    throwIfMissing: false,
  });

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

// export async function addToCartAction({ productId, color, size, quantity = 1 }) {
//   await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
//   const user = await requireDbUser();
//   return withPerf("cart.add", () =>
//     cartService.addItem(user.id, { productId, color, size, quantity }),
//   );
// }

export async function addToCartAction({
  productId,
  color,
  size,
  quantity = 1,
}) {
  await assertRateLimit({
    prefix: "cart",
    limit: 60,
    windowMs: 60_000,
  });

  const user = await requireDbUser({
    throwIfMissing: false,
  });

  if (!user) {
    throw new Error("Please sign in first.");
  }

  return withPerf("cart.add", () =>
    cartService.addItem(user.id, {
      productId,
      color,
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

  const user = await requireDbUser({
    throwIfMissing: false,
  });

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

  const user = await requireDbUser({
    throwIfMissing: false,
  });

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
  const user = await requireDbUser({
    throwIfMissing: false,
  });

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
