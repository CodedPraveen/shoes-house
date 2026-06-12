"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { cartService } from "@/services/cart-service";
import { userService } from "@/services/user-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { withPerf } from "@/lib/perf";

// async function requireDbUser() {
//   const { userId: clerkId } = await auth();
//   if (!clerkId) throw new Error("Unauthorized");
//   const user = await userService.getByClerkId(clerkId);
//   if (!user) throw new Error("User not synced. Sign in again.");
//   return user;
// }

async function requireDbUser() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  let user = await userService.getByClerkId(clerkId);

  if (user) return user;

  console.log("AUTO CREATING USER");

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);

  user = await userService.upsertFromClerk({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0].emailAddress,
    name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
  });

  return user;
}

export async function getCartAction() {
  const user = await requireDbUser();
  return withPerf("cart.get", () => cartService.getCartSummary(user.id));
}

export async function addToCartAction({ productId, color, size, quantity = 1 }) {
  await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
  const user = await requireDbUser();
  return withPerf("cart.add", () =>
    cartService.addItem(user.id, { productId, color, size, quantity }),
  );
}

export async function updateCartQuantityAction(lineId, quantity) {
  await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
  const user = await requireDbUser();
  return withPerf("cart.update", () =>
    cartService.updateQuantity(user.id, lineId, quantity),
  );
}

export async function removeFromCartAction(lineId) {
  await assertRateLimit({ prefix: "cart", limit: 60, windowMs: 60_000 });
  const user = await requireDbUser();
  return withPerf("cart.remove", () => cartService.removeItem(user.id, lineId));
}

export async function clearCartAction() {
  const user = await requireDbUser();
  return withPerf("cart.clear", () => cartService.clearCart(user.id));
}
