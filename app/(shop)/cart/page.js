"use client";

import Link from "next/link";
import Image from "next/image";
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

  const handleBuyNow = (item) => {
    const q = new URLSearchParams({
      productId: item.productId,
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
            <div className="no54123-3xl border border-black/10 bg-zinc-50 px-8 py-16 text-center">
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="mt-2 text-sm text-black/60">
                Explore new arrivals and trending drops.
              </p>
              <Link
                href="/new-arrivals"
                className="mt-6 inline-block no54123-full bg-black px-6 py-3 text-sm text-white"
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
                    className="flex flex-wrap gap-5 no54123-3xl border border-black/10 bg-white p-4 sm:flex-nowrap"
                  >
                    <Image
                      width={112}
                      height={112}
                      src={item.image}
                      alt={item.name}
                      className="h-28 w-28 no54123-2xl object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="mt-1 text-sm text-black/60">
                          Color: {item.color} · Size: {item.size}
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-black/15 rounded-full">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, Math.max(1, item.quantity - 1))
                            }
                            className="p-2"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="px-4 text-sm">{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-black/50 hover:text-black"
                          >
                            <Trash2 size={16} />
                          </button>

                          <button
                            onClick={() => handleBuyNow(item)}
                            className="rounded-full bg-black px-4 py-2 text-white"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <aside className="h-fit no54123-3xl border border-black/10 bg-zinc-50 p-6">
                <h3 className="text-lg font-medium">Order Summary</h3>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="space-y-2 border-b border-black/10 pb-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="truncate max-w-[180px]">
                          {item.name} × {item.quantity}
                        </span>

                        <span>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => router.push("/checkout")}
                      className="w-full rounded-full bg-black py-3 text-sm font-medium text-white transition hover:scale-[1.01]"
                    >
                      Checkout
                    </button>
                    <Link
                      href="/orders"
                      className="block w-full text-center rounded-full border border-black/20 py-3 text-sm font-medium text-black transition hover:bg-black/5"
                    >
                      View Orders
                    </Link>
                  </div>
                </div>

              </aside>
            </div>
          )}
        </div>
      </main>
    </AuthGate>
  );
}
