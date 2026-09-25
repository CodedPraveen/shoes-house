import { wishlistService } from "@/services/wishlist-service";
import { invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";

export async function DELETE(request, { params }) {
  const { productId } = await params;
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(productId)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    await wishlistService.remove(user.id, productId);
    return new Response(null, { status: 204 });
  }, { mutation: true });
}
