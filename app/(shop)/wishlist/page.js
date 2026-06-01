import WishlistPageClient from "@/components/wishlist-page-client";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wishlist | AERÉ",
};

export default async function WishlistPage() {
  const allProducts = await productService.getAll();
  return <WishlistPageClient allProducts={allProducts} />;
}
