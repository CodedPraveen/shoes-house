"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, updateQuantity, removeItem, hydrated } =
    useCart();

  const handleCheckoutAll = () => {
    const cartItems = encodeURIComponent(JSON.stringify(items));
    router.push(`/checkout?cart=${cartItems}`);
  };

  const handleBuyNow = (item) => {
    const q = new URLSearchParams({
      productId: item.productId,
      color: item.color,
      size: String(item.size),
      quantity: String(item.quantity),
    });
    router.push(`/checkout/buy-now?${q.toString()}`);
  };

  return (
    <AuthGate>
    <main className="pt-20">
      <PageHeader
        eyebrow="Cart"
        title="Your bag"
        description={`${itemCount} item${itemCount !== 1 ? "s" : ""} in cart`}
      />

      <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8">
        {!hydrated ? (
          <p className="text-sm text-black/50">Loading cart...</p>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-black/10 bg-zinc-50 px-8 py-16 text-center">
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="mt-2 text-sm text-black/60">
              Explore new arrivals and trending drops.
            </p>
            <Link
              href="/new-arrivals"
              className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm text-white"
            >
              Shop New Arrivals
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap gap-5 rounded-3xl border border-black/10 bg-white p-4 sm:flex-nowrap"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-28 rounded-2xl object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="mt-1 text-sm text-black/60">
                        Color: {item.color} · Size: {item.size}
                      </p>
                      <p className="mt-2 text-sm font-medium">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center rounded-full border border-black/15">
                        <button
                          type="button"
                          onClick={() =>
                            item.quantity <= 1
                              ? removeItem(item.id)
                              : updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-2"
                          aria-label="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-2"
                          aria-label="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full p-2 text-black/50 transition hover:bg-black/5 hover:text-black"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBuyNow(item)}
                        className="ml-auto flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium text-white transition hover:scale-[1.01]"
                        aria-label="Buy now"
                      >
                        <ShoppingBag size={14} />
                        Buy Now
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-3xl border border-black/10 bg-zinc-50 p-6">
              <h3 className="text-lg font-medium">Order Summary</h3>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/60">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/60">Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCheckoutAll}
                className="mt-6 w-full rounded-full bg-black py-3 text-sm font-medium text-white transition hover:scale-[1.01]"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
    </AuthGate>
  );
}
