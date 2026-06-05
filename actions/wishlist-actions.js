"use server";

import { auth } from "@clerk/nextjs/server";
import { wishlistService } from "@/services/wishlist-service";
import { userService } from "@/services/user-service";

// async function requireDbUser() {
//   const { userId: clerkId } = await auth();
//   if (!clerkId) throw new Error("Unauthorized");
//   const user = await userService.getByClerkId(clerkId);
//   if (!user) throw new Error("User not synced");
//   return user;
// }

async function requireDbUser() {
  const { userId: clerkId } = await auth();

  console.log("CLERK ID:", clerkId);

  if (!clerkId) throw new Error("Unauthorized");

  const user = await userService.getByClerkId(clerkId);

  console.log("DB USER:", user);

  if (!user) throw new Error("User not synced");

  return user;
}

export async function getWishlistIdsAction() {
  const user = await requireDbUser();
  return wishlistService.getProductIds(user.id);
}

export async function toggleWishlistAction(productId) {
  const user = await requireDbUser();
  const added = await wishlistService.toggle(user.id, productId);
  const ids = await wishlistService.getProductIds(user.id);
  return { added, productIds: ids };
}
