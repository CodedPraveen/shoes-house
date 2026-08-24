"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ProductRecommendations from "@/components/product-recommendations";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-routes";
import LoadingButton from "@/components/ui/loading-button";

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const { isSignedIn } = useAuthSafe();

  const images = (product.images || []).map(
    optimizeCloudinaryImage,
  );

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState(product.sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pendingActions, setPendingActions] = useState(
    new Set(),
  );
  const [actionError, setActionError] = useState("");

  const pendingRef = useRef(new Set());
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const currentImage =
    images[activeImage] || images[0] || "";

  const goToImage = (index) => {
    if (!images.length) return;

    const nextIndex =
      (index + images.length) % images.length;

    setActiveImage(nextIndex);
  };

  const previousImage = () => {
    goToImage(activeImage - 1);
  };

  const nextImage = () => {
    goToImage(activeImage + 1);
  };

  /*
   * Mobile swipe gesture.
   *
   * We only react when horizontal movement is stronger
   * than vertical movement, so normal page scrolling
   * remains untouched.
   */
  const handleTouchStart = (event) => {
    const touch = event.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (event) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const touch = event.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /*
     * Ignore mostly vertical gestures.
     */
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    /*
     * Ignore tiny movements.
     */
    if (Math.abs(deltaX) < 45) {
      return;
    }

    if (deltaX < 0) {
      nextImage();
    } else {
      previousImage();
    }
  };

  const runAction = async (name, action) => {
    if (pendingRef.current.has(name)) {
      return false;
    }

    pendingRef.current.add(name);

    setPendingActions(
      new Set(pendingRef.current),
    );

    setActionError("");

    try {
      await action();
      return true;
    } catch (error) {
      setActionError(
        error?.message ||
        "Could not complete this action. Please try again.",
      );

      return false;
    } finally {
      pendingRef.current.delete(name);

      setPendingActions(
        new Set(pendingRef.current),
      );
    }
  };

  const requireAuth = (action) => {
    if (hasClerk && !isSignedIn) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(
          getProductPath(product),
        )}`,
      );

      return false;
    }

    action();

    return true;
  };

  const handleAddToCart = () => {
    if (!size) {
      setActionError(
        "Please select a size before continuing.",
      );
      return;
    }

    requireAuth(() =>
      runAction("cart", () =>
        addItem({
          product,
          size,
          quantity,
        }),
      ).then((success) => {
        if (!success) return;

        setAdded(true);

        setTimeout(() => {
          setAdded(false);
        }, 2000);
      }),
    );
  };

  const handleWishlist = () => {
    requireAuth(() =>
      runAction("wishlist", () =>
        toggleWishlist(product.id),
      ),
    );
  };

  const handleBuyNow = () => {
    if (!size) {
      setActionError(
        "Please select a size before continuing.",
      );
      return;
    }

    requireAuth(() => {
      const q = new URLSearchParams({
        productId: product.id,
        size: String(size),
        quantity: String(quantity),
      });

      router.push(
        `/checkout/buy-now?${q.toString()}`,
      );
    });
  };

  const wishlistActive = isInWishlist(product.id);

  return (
    <>
      <main className="mx-auto mt-8 w-full max-w-[1400px] px-0 pb-32 pt-0 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        {/* =========================
            MOBILE HEADER
        ========================== */}
        <div className="mb-5 flex items-center justify-between px-4 sm:hidden">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-11 w-11 items-center justify-center border border-black/10 bg-white transition active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-lg font-semibold tracking-tight">
            Details
          </h1>

          <LoadingButton
            type="button"
            onClick={handleWishlist}
            loading={pendingActions.has("wishlist")}
            className={`flex h-11 w-11 items-center justify-center border border-black/10 transition active:scale-95 ${wishlistActive
              ? "bg-black text-white"
              : "bg-white"
              }`}
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
          </LoadingButton>
        </div>

        {/* =========================
            PRODUCT TOP AREA
        ========================== */}
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:gap-16">
          {/* =========================
              PRODUCT GALLERY
              DESKTOP:
              MAIN IMAGE + VERTICAL THUMBS

              MOBILE:
              MAIN IMAGE + SWIPE
          ========================== */}
          <div className="min-w-0">
            <div className="lg:flex lg:items-start lg:gap-4">
              {/* Main image */}
              <div
                className="relative w-full touch-pan-y overflow-hidden bg-[#f7f7f5] lg:order-1 lg:flex-1"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="aspect-[2/3] w-full sm:aspect-[4/5] lg:aspect-[2/3]">
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="h-full w-full select-none object-contain"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                      No image
                    </div>
                  )}
                </div>

                {/* Mobile arrows */}
                {images.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={previousImage}
                      className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition active:scale-95 sm:flex lg:hidden"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-sm transition active:scale-95 sm:flex lg:hidden"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                ) : null}
              </div>

              {/* =========================
                  DESKTOP THUMBNAILS
              ========================== */}
              {images.length > 1 ? (
                <div className="hidden w-[76px] shrink-0 flex-col gap-3 lg:order-2 lg:flex">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImage(index)
                      }
                      className={`relative aspect-square w-full overflow-hidden border bg-[#f7f7f5] transition ${activeImage === index
                        ? "border-black"
                        : "border-transparent hover:border-black/30"
                        }`}
                      aria-label={`View image ${index + 1
                        }`}
                      aria-current={
                        activeImage === index
                      }
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1
                          }`}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* =========================
                MOBILE THUMBNAILS
            ========================== */}
            {images.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
                {images.map((image, index) => (
                  <button
                    key={`${image}-mobile-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveImage(index)
                    }
                    className={`h-16 w-16 shrink-0 overflow-hidden border bg-[#f7f7f5] ${activeImage === index
                      ? "border-black"
                      : "border-black/10"
                      }`}
                    aria-label={`View image ${index + 1
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1
                        }`}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            ) : null}

            {/* Mobile swipe hint */}
            {images.length > 1 ? (
              <div className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/35 lg:hidden">
                Swipe to view images
              </div>
            ) : null}
          </div>

          {/* =========================
              PRODUCT INFO
          ========================== */}
          <div className="min-w-0 space-y-7 px-4 sm:px-6 lg:px-0 lg:pt-1">
            {/* Brand / Name / Price */}
            <div className="space-y-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/45 sm:text-xs sm:tracking-[0.25em]">
                {product.brand}
              </p>

              <h2 className="max-w-2xl text-2xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="text-2xl font-semibold sm:text-3xl">
                  {formatPrice(product.price)}
                </p>

                {product.compareAtPrice ? (
                  <p className="text-base text-black/40 line-through sm:text-lg">
                    {formatPrice(
                      product.compareAtPrice,
                    )}
                  </p>
                ) : null}

                {product.discount ? (
                  <span className="bg-black px-2.5 py-1 text-[11px] text-white sm:text-xs">
                    -{product.discount}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Description */}
            <p className="max-w-xl text-sm leading-6 text-black/60 sm:text-base sm:leading-7">
              {product.description}
            </p>

            {/* =========================
                SIZE
            ========================== */}
            <div className="space-y-4 border-t border-black/10 pt-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
                  Size
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`min-h-11 min-w-11 border px-3.5 text-sm transition ${size === item
                      ? "border-black bg-black text-white"
                      : "border-black/15 hover:border-black/40"
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {!size && actionError ? (
                <p
                  className="text-sm text-red-600"
                  role="alert"
                >
                  {actionError}
                </p>
              ) : null}
            </div>

            {/* =========================
                QUANTITY
            ========================== */}
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
                Quantity
              </p>

              <div className="inline-flex items-center border border-black/15">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1),
                    )
                  }
                  className="p-3.5 transition hover:bg-black/5 active:bg-black/10"
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
                  className="p-3.5 transition hover:bg-black/5 active:bg-black/10"
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* =========================
                ACTIONS
            ========================== */}
            <div className="hidden flex-wrap gap-3 sm:flex">
              <LoadingButton
                type="button"
                onClick={handleAddToCart}
                loading={pendingActions.has("cart")}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-black px-7 text-sm font-medium text-white transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingBag size={16} />

                {added
                  ? "Added to Cart"
                  : "Add To Cart"}
              </LoadingButton>

              <button
                type="button"
                onClick={handleBuyNow}
                className="min-h-12 border border-black/15 px-7 text-sm font-medium transition hover:bg-black hover:text-white active:scale-[0.98]"
              >
                Buy Now
              </button>

              <LoadingButton
                type="button"
                onClick={handleWishlist}
                loading={pendingActions.has("wishlist")}
                className={`flex min-h-12 min-w-12 items-center justify-center border border-black/15 p-3 transition hover:bg-black/5 active:scale-95 ${wishlistActive
                  ? "bg-black text-white"
                  : ""
                  }`}
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
              </LoadingButton>
            </div>

            {actionError && size ? (
              <p
                className="text-sm text-red-600"
                role="alert"
              >
                {actionError}
              </p>
            ) : null}

            {/* =========================
                DESKTOP PRODUCT DETAILS
                ONLY DESKTOP
            ========================== */}
            <div className="hidden border-t border-black/10 pt-7 lg:block">
              <h3 className="mb-3 text-base font-medium">
                Product Details
              </h3>

              <p className="max-w-xl text-sm leading-7 text-black/60">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* =========================
            PRODUCT DETAILS
            TABLET + MOBILE

            Desktop uses the version above
            directly below the action buttons.
        ========================== */}
        <div className="mt-12 border-t border-black/10 pt-10 sm:mt-16 sm:pt-12 lg:hidden">
          <div>
            <div className="mb-5 border-b border-black/10 pb-3">
              <h3 className="text-base font-medium">
                Product Details
              </h3>
            </div>

            <p className="text-sm leading-7 text-black/60">
              {product.description}
            </p>
          </div>
        </div>

        {/* =========================
            RECOMMENDATIONS
        ========================== */}
        <div className="mt-14 sm:mt-16">
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
          <LoadingButton
            type="button"
            onClick={handleAddToCart}
            loading={pendingActions.has("cart")}
            className="flex h-14 w-14 shrink-0 items-center justify-center border border-black/10 bg-black/5 transition active:scale-95"
            aria-label={
              added
                ? "Added to cart"
                : "Add to cart"
            }
          >
            <ShoppingBag size={22} />
          </LoadingButton>

          <button
            type="button"
            onClick={handleBuyNow}
            className="flex h-14 flex-1 items-center justify-center bg-[#ffe51f] text-base font-semibold text-black transition active:scale-[0.98]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </>
  );
}