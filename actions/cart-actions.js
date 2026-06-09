"use server";

import { auth } from "@clerk/nextjs/server";
import { cartService } from "@/services/cart-service";
import { userService } from "@/services/user-service";
import { assertRateLimit } from "@/lib/rate-limit";

async function requireDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  const user = await userService.getByClerkId(clerkId);
  if (!user) throw new Error("User not synced. Sign in again.");
  return user;
}

async function rateLimitCart() {
  await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
}

export async function getCartAction() {
  const user = await requireDbUser();
  const items = await cartService.getCartItemsForClient(user.id);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return {
    items,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
  };
}

// export async function addToCartAction({ productId, color, size, quantity }) {
//   await rateLimitCart();
//   const user = await requireDbUser();
//   await cartService.addItem(user.id, { productId, color, size, quantity });
//   return getCartAction();
// }
export async function addToCartAction(data) {
  await rateLimitCart();
  await rateLimitCart();

  const user = await requireDbUser();

  await cartService.addItem(user.id, data);

  const items = await cartService.getCartItemsForClient(user.id);

  const subtotal = items.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  return {
    items,
    itemCount: items.reduce(
      (s, i) => s + i.quantity,
      0
    ),
    subtotal,
  };
}

export async function updateCartQuantityAction(lineId, quantity) {
  const user = await requireDbUser();
  await cartService.updateQuantity(user.id, lineId, quantity);
  return getCartAction();
}

export async function removeFromCartAction(lineId) {
  const user = await requireDbUser();
  await cartService.removeItem(user.id, lineId);
  return getCartAction();
}

export async function clearCartAction() {
  const user = await requireDbUser();
  await cartService.clearCart(user.id);
  return getCartAction();
}
