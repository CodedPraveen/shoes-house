"use client";

import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import ProductGrid from "@/components/product-grid";
import { useWishlist } from "@/hooks/use-wishlist";
import { productService } from "@/services/product-service";

export default function WishlistPage() {
  const { productIds } = useWishlist();
  const products = productService
    .getAll()
    .filter((p) => productIds.includes(p.id));

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Wishlist"
          title="Saved pairs"
          description={`${products.length} item${products.length !== 1 ? "s" : ""} in your wishlist.`}
        />
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8">
          {products.length === 0 ? (
            <p className="text-center text-sm text-black/50">
              Your wishlist is empty. Explore{" "}
              <a href="/products" className="underline">
                all shoes
              </a>
              .
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </main>
    </AuthGate>
  );
}
