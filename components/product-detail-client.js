"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import { Heart, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import ProductRecommendations from "@/components/product-recommendations";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-routes";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { isSignedIn } = useAuthSafe();

  const [size, setSize] = useState(product.sizes[0] ?? 40);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const requireAuth = (action) => {
    if (hasClerk && !isSignedIn) {
      router.push(
        `/ sign -in? redirect_url = ${
  encodeURIComponent(
    getProductPath(product),
  )
} `,
      );

      return false;
    }

    action();
    return true;
  };

  const handleAddToCart = () => {
    requireAuth(() => {
      addItem({
        product,
        size,
        quantity,
      });

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2000);
    });
  };

  const handleWishlist = () => {
    requireAuth(() => toggleWishlist(product.id));
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      const q = new URLSearchParams({
        productId: product.id,
        size: String(size),
        quantity: String(quantity),
      });

      router.push(`/ checkout / buy - now ? ${ q.toString() } `);
    });
  };

  const wishlistActive = isInWishlist(product.id);

  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-32 pt-4 sm:space-y-16 sm:px-6 sm:py-14 lg:space-y-20 lg:px-8 lg:py-20">
        {/* =========================
            MOBILE HEADER
        ========================== */}
        <div className="mb-5 flex items-center justify-between sm:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center no54123-full border border-black/10 bg-white transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-semibold tracking-tight">
            Details
          </h1>

          <button
            type="button"
            onClick={handleWishlist}
            className={`flex h - 11 w - 11 items - center justify - center no54123 - full border border - black / 10 transition active: scale - 95 ${
  wishlistActive
    ? "bg-black text-white"
    : "bg-white"
} `}
            aria-label={
              wishlistActive
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <Heart
              size={20}
              fill={wishlistActive ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* =========================
            PRODUCT
        ========================== */}
        <div className="grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-12">
          {/* =========================
              GALLERY
          ========================== */}
          <div className="min-w-0">
            <ProductGallery
              images={(product.images || []).map(
                optimizeCloudinaryImage,
              )}
              name={product.name}
            />
          </div>

          {/* =========================
              PRODUCT INFO
          ========================== */}
          <div className="min-w-0 space-y-7 sm:space-y-8">
            {/* Brand / Name / Price */}
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/45 sm:text-xs sm:tracking-[0.25em]">
                {product.brand}
              </p>

              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {product.name}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-xl font-semibold sm:text-2xl">
                  {formatPrice(product.price)}
                </p>

                {product.compareAtPrice && (
                  <p className="text-base text-black/40 line-through sm:text-lg">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}

                {product.discount && (
                  <span className="no54123-full bg-black px-2.5 py-1 text-[11px] text-white sm:px-3 sm:text-xs">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="max-w-xl text-sm leading-6 text-black/65 sm:text-base sm:leading-relaxed">
              {product.description}
            </p>

            {/* =========================
                SIZE
            ========================== */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-black/45 sm:text-xs">
                Size
              </p>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`no54123 - full min - h - 11 min - w - 11 border px - 3.5 text - sm transition sm: px - 4 ${
  size === item
    ? "border-black bg-black text-white"
    : "border-black/15 hover:border-black/40"
} `}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* =========================
                QUANTITY
            ========================== */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-black/45 sm:text-xs">
                Quantity
              </p>

              <div className="inline-flex items-center no54123-full border border-black/15">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1),
                    )
                  }
                  className="no54123-full p-3.5 transition hover:bg-black/5 active:bg-black/10"
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-11 text-center text-sm font-medium">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => q + 1)
                  }
                  className="no54123-full p-3.5 transition hover:bg-black/5 active:bg-black/10"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* =========================
                DESKTOP ACTIONS
            ========================== */}
            <div className="hidden flex-wrap gap-3 sm:flex">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex min-h-12 items-center justify-center gap-2 no54123-full bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag size={16} />

                {added
                  ? "Added to Cart"
                  : "Add To Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="min-h-12 no54123-full border border-black/15 px-7 text-sm font-medium transition hover:bg-black hover:text-white active:scale-[0.98]"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={handleWishlist}
                className={`flex min - h - 12 min - w - 12 items - center justify - center no54123 - full border border - black / 15 p - 3 transition hover: bg - black / 5 active: scale - 95 ${
  wishlistActive
    ? "bg-black text-white"
    : ""
} `}
                aria-label={
                  wishlistActive
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
              >
                <Heart
                  size={20}
                  fill={
                    wishlistActive
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            PRODUCT INFORMATION
        ========================== */}
        <div className="mt-12 grid gap-8 border-t border-black/10 pt-10 sm:mt-0 sm:pt-12 md:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-medium">
              Product Details
            </h3>

            <p className="text-sm leading-6 text-black/60">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">
              Materials
            </h3>

            <p className="text-sm leading-6 text-black/60">
              {product.materials}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium">
              Shipping & Returns
            </h3>

            <p className="text-sm leading-6 text-black/60">
              {product.shipping}
            </p>

            <p className="mt-2 text-sm leading-6 text-black/60">
              {product.returnPolicy}
            </p>
          </div>
        </div>

        {/* =========================
            RECOMMENDATIONS
        ========================== */}
        <div className="mt-12 sm:mt-0">
          <ProductRecommendations
            slug={product.slug}
            productId={product.id}
            brand={product.brand}
            category={product.category}
            price={product.price}
          />
        </div>
      </main>

      {/* =========================
          MOBILE FIXED PURCHASE BAR
      ========================== */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 px-4 pt-3 backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-[600px] items-center gap-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {/* Add To Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-14 w-14 shrink-0 items-center justify-center no54123-full border border-black/10 bg-black/5 transition active:scale-95"
            aria-label={
              added
                ? "Added to cart"
                : "Add to cart"
            }
          >
            <ShoppingBag size={22} />
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-14 flex-1 items-center justify-center no54123-full bg-black text-base font-semibold text-white transition active:scale-[0.98]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}

