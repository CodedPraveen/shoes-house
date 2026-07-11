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
          <Image
            src={product.image}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              window.open(
                `https://wa.me/919166869035?text=${encodeURIComponent(
                  `Hi, I'm interested in this 
                   Product: ${product.name},
                  Price: ₹${product.price}

Link: ${productUrl}`
                )}`,
                "_blank"
              );
            }}
            className="absolute left-3 bottom-3 z-10 text-[#25d366] p-2 rounded-full"
          >
            <svg width="24" height="24" viewBox="0 0 1024 1024" fill="none">
              <rect width="1024" height="1024" rx="265" fill="#00db40"></rect>
              <path d="M522 141C320.419 141 157 304.419 157 506C157 572.322 174.689 634.507 205.606 688.101L157 871L346.617 826.173C398.664 854.744 458.429 871 522 871C723.581 871 887 707.581 887 506C887 304.419 723.581 141 522 141ZM522 805.624C460.998 805.624 404.254 787.388 356.919 756.079L244.891 784.61L276.314 677.536C242.322 628.944 222.376 569.801 222.376 506C222.376 340.52 356.52 206.376 522 206.376C687.48 206.376 821.624 340.52 821.624 506C821.624 671.48 687.48 805.624 522 805.624Z" fill="white"></path>
              <path d="M607.527 554.187L695.836 595.825C699.892 597.737 702.488 601.847 702.123 606.315C701.163 617.934 696.506 641.226 675.626 662.099C616.692 721.033 510.876 654.36 506.577 651.778C480.554 637.799 455.815 619.09 432.374 595.642C408.933 572.201 390.217 547.462 376.238 521.439C373.656 517.14 306.983 411.317 365.917 352.39C386.796 331.51 410.082 326.853 421.701 325.893C426.169 325.528 430.279 328.124 432.192 332.18L473.829 420.489C473.829 420.489 475.802 424.667 473.829 420.489L473.829 420.489ZM473.829 420.489C475.802 424.667 474.937 429.635 471.666 432.899L440.627 463.938C433.915 470.65 431.942 481.1 436.565 489.393C447.887 509.705 463.115 529.259 480.764 547.252C498.757 564.894 518.318 580.129 538.623 591.451C546.917 596.075 557.366 594.108 564.078 587.389L595.117 556.35C598.381 553.086 603.35 552.221 607.527 554.187Z" fill="white"></path>
            </svg>

          </button>

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

