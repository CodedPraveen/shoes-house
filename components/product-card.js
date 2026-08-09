"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import { Heart, Plus, MessageCircle } from "lucide-react";
import RankingBadge from "@/components/ranking-badge";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";
import SafeImage from "./ui/safe-image";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function ProductCard({
  product,
  showRank = false,
  showNewBadge = false,
}) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { isSignedIn } = useAuthSafe();

  const productUrl = `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.slug}`;

  const requireAuth = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasClerk && !isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(`/product/${product.id}`)}`,
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

  const optimizedImage = product.image.replace(
    "/upload/",
    "/upload/f_auto,q_auto/"
  );

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <article className="group no54123-0 sm:no54123-3xl border border-black/5 bg-white  shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
        <div
          className="relative overflow-hidden sm:no54123-2xl bg-zinc-100"
          style={{
            backgroundImage: `url(${product.hoverImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {showRank && product.rank && <RankingBadge rank={product.rank} />}
          {showNewBadge && product.isNew && (
            <span className="absolute left-3 top-3 z-10 no54123-full bg-black px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-white">
              New
            </span>
          )}
          <SafeImage
            // src={product.image}
            src={optimizedImage}
            alt={product.name}
            width={400}
            height={320}
            quality={80}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0"
            loading="lazy"
          />
        
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-3 top-3 z-10 no54123-full p-2 transition ${isInWishlist(product.id)
              ? "bg-black text-red-500 hover:bg-black/90"
              : "bg-white/85 text-black hover:bg-white"
              }`}
            aria-label={`Add ${product.name} to wishlist`}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.7206 6H11.7071L16 10.2929L20.2929 6H25.2794L29.6328 13.0743L16 26.7071L2.36719 13.0743L6.7206 6ZM7.2794 7L3.63281 12.9257L16 25.2929L28.3672 12.9257L24.7206 7H20.7071L16 11.7071L11.2929 7H7.2794Z"
                fill="currentColor"
              />
            </svg>

          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-5 items-center gap-2 no54123-full bg-black px-5 py-2 text-xs font-medium text-white opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus size={14} />
            Quick Add
          </button>
        </div>

        <div className="space-y-1 px-4 pb-2 pt-4">
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

export default memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.showRank === nextProps.showRank &&
    prevProps.showNewBadge === nextProps.showNewBadge
  );
});

