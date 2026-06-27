"use client";

import Link from "next/link";
import ProductGrid from "@/components/product-grid";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { formatPrice } from "@/lib/format-price";
import AddressManager from "@/components/address-manager";

export default function ProfileClient({ user, allProducts = [] }) {
  const { items, subtotal, itemCount } = useCart();
  const { productIds: wishlistIds } = useWishlist();
  const { productIds: recentIds } = useRecentlyViewed();

  const wishlistProducts = allProducts
    .filter((p) => wishlistIds.includes(p.id))
    .slice(0, 4);

  const recentProducts = recentIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-12 px-5 pb-20 sm:px-8">
      <div className="no54123-3xl border border-black/10 bg-zinc-50 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-black/45">Account</p>
        <p className="mt-2 text-2xl font-semibold">
          {user?.firstName} {user?.lastName}
        </p>
        <p className="mt-1 text-sm text-black/60">
          {user?.emailAddresses?.[0]?.emailAddress}
        </p>
      </div>

      <section className="grid gap-6 sm:grid-cols-3">
        <Link
          href="/cart"
          className="no54123-3xl border border-black/10 p-6 transition hover:border-black/30"
        >
          <p className="text-sm text-black/50">Cart</p>
          <p className="mt-2 text-xl font-medium">{itemCount} items</p>
          <p className="text-sm text-black/60">{formatPrice(subtotal)}</p>
        </Link>
        <Link
          href="/wishlist"
          className="no54123-3xl border border-black/10 p-6 transition hover:border-black/30"
        >
          <p className="text-sm text-black/50">Wishlist</p>
          <p className="mt-2 text-xl font-medium">{wishlistIds.length} saved</p>
        </Link>
        <Link
          href="/orders"
          className="no54123-3xl border border-black/10 p-6 transition hover:border-black/30"
        >
          <p className="text-sm text-black/50">Orders</p>
          <p className="mt-2 text-xl font-medium">View history</p>
        </Link>
      </section>

      {items.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cart summary</h2>
          <ul className="space-y-2 text-sm text-black/70">
            {items.slice(0, 3).map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} · {item.color} · {item.size}
                </span>
                <span>×{item.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {wishlistProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Wishlist preview</h2>
          <ProductGrid products={wishlistProducts} />
        </section>
      )}

      <AddressManager />

      {recentProducts.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Recently viewed</h2>
          <ProductGrid products={recentProducts} />
        </section>
      )}
    </div>
  );
}
