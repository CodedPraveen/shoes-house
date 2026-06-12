"use server";

import { wishlistService } from "@/services/wishlist-service";
import { requireDbUser } from "@/lib/require-db-user";

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
