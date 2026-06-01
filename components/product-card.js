"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import { Heart, Plus } from "lucide-react";
import RankingBadge from "@/components/ranking-badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function ProductCard({
  product,
  showRank = false,
  showNewBadge = false,
}) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { isSignedIn } = useAuthSafe();

  const requireAuth = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasClerk && !isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(`/product/${product.slug}`)}`,
      );
      return;
    }
    action();
  };

  const handleQuickAdd = (e) => {
    requireAuth(e, () =>
      addItem({
        product,
        color: product.colors[0]?.id ?? "black",
        size: product.sizes[0] ?? 40,
        quantity: 1,
      }),
    );
  };

  const handleWishlist = (e) => {
    requireAuth(e, () => toggleWishlist(product.id));
  };

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <article className="group rounded-3xl border border-black/5 bg-white p-3 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
        <div className="relative overflow-hidden rounded-2xl bg-zinc-100">
          {showRank && product.rank && <RankingBadge rank={product.rank} />}
          {showNewBadge && product.isNew && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-black px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-white">
              New
            </span>
          )}
          <img
            src={product.image}
            alt={product.name}
            className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <img
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          />

          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-3 top-3 z-10 rounded-full p-2 transition ${
              isInWishlist(product.id)
                ? "bg-black text-white"
                : "bg-white/85 text-black hover:bg-white"
            }`}
            aria-label={`Add ${product.name} to wishlist`}
          >
            <Heart size={16} />
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-5 items-center gap-2 rounded-full bg-black px-5 py-2 text-xs font-medium text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus size={14} />
            Quick Add
          </button>
        </div>

        <div className="space-y-1 px-1 pb-2 pt-4">
          <p className="text-xs uppercase tracking-[0.22em] text-black/45">
            {product.categoryLabel || product.category}
          </p>
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-lg font-medium tracking-tight">{product.name}</h3>
            <span className="text-sm text-black/70">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
