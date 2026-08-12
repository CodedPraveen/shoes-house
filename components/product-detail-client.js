"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import ProductGallery from "@/components/product-gallery";
import ProductRecommendations from "@/components/product-recommendations";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format-price";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function ProductDetailClient({ product }) {
  const color = product.colors[0]?.id;
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
        `/sign-in?redirect_url=${encodeURIComponent(`/product/${product.slug}`)}`,
      );
      return false;
    }
    action();
    return true;
  };

  const handleAddToCart = () => {
    requireAuth(() => {
      addItem({ product, color, size, quantity });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    });
  };

  const handleWishlist = () => {
    requireAuth(() => toggleWishlist(product.id));
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      const q = new URLSearchParams({
        productId: product.id,
        color,
        size: String(size),
        quantity: String(quantity),
      });

      router.push(`/checkout/buy-now?${q.toString()}`);
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1400] space-y-20 px-5 py-24 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-2">

        <ProductGallery images={(product.images || []).map(optimizeCloudinaryImage)} name={product.name} />

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">
              {product.brand}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-2xl font-medium">{formatPrice(product.price)}</p>
              {product.compareAtPrice && (
                <p className="text-lg text-black/40 line-through">
                  {formatPrice(product.compareAtPrice)}
                </p>
              )}
              {product.discount && (
                <span className="no54123-full bg-black px-3 py-1 text-xs text-white">
                  -{product.discount}%
                </span>
              )}
            </div>
          </div>

          <p className="max-w-lg text-sm leading-relaxed text-black/65 sm:text-base">
            {product.description}
          </p>

          <div className="space-y-4"></div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`h-11 min-w-11 no54123-full border px-4 text-sm transition ${size === item
                    ? "border-black bg-black text-white"
                    : "border-black/15 hover:border-black/40"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45">
              Quantity
            </p>
            <div className="inline-flex items-center no54123-full border border-black/15">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="no54123-full p-3 transition hover:bg-black/5"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="no54123-full p-3 transition hover:bg-black/5"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center gap-2 no54123-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
            >
              <ShoppingBag size={16} />
              {added ? "Added to Cart" : "Add To Cart"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="no54123-full border border-black/15 px-7 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={handleWishlist}
              className={`no54123-full border border-black/15 p-4 transition hover:bg-black/5 ${isInWishlist(product.id) ? "bg-black text-white" : ""
                }`}
              aria-label="Add to wishlist"
            >
              <Heart size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 border-t border-black/10 pt-12 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-sm font-medium">Product Details</h3>
          <p className="text-sm text-black/60">{product.description}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Materials</h3>
          <p className="text-sm text-black/60">{product.materials}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Shipping & Returns</h3>
          <p className="text-sm text-black/60">{product.shipping}</p>
          <p className="mt-2 text-sm text-black/60">{product.returnPolicy}</p>
        </div>
      </div>

      <ProductRecommendations
        slug={product.slug}
        productId={product.id}
        brand={product.brand}
        category={product.category}
        price={product.price}
      />
    </div>
  );
}
