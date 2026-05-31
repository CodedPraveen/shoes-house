"use client";

import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Checkout"
          title="Complete your order"
          description="Shipping and payment — Razorpay integration coming soon."
        />
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-2">
          <section className="space-y-6 rounded-3xl border border-black/10 bg-zinc-50 p-6">
            <h2 className="text-lg font-medium">Shipping Address</h2>
            <p className="text-sm text-black/60">
              Address form will connect to Prisma Address model.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                placeholder="Full name"
                className="h-11 rounded-xl border border-black/15 bg-white px-4 text-sm"
              />
              <input
                placeholder="Phone"
                className="h-11 rounded-xl border border-black/15 bg-white px-4 text-sm"
              />
              <input
                placeholder="Address line 1"
                className="h-11 rounded-xl border border-black/15 bg-white px-4 text-sm sm:col-span-2"
              />
              <input
                placeholder="City"
                className="h-11 rounded-xl border border-black/15 bg-white px-4 text-sm"
              />
              <input
                placeholder="PIN code"
                className="h-11 rounded-xl border border-black/15 bg-white px-4 text-sm"
              />
            </div>
          </section>
          <section className="space-y-6 rounded-3xl border border-black/10 p-6">
            <h2 className="text-lg font-medium">Order Summary</h2>
            <ul className="space-y-3 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4">
                  <span className="text-black/70">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-black/10 pt-4 font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="rounded-2xl border border-dashed border-black/20 bg-zinc-50 p-4 text-sm text-black/60">
              Payment section — Razorpay checkout will mount here.
            </div>
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-black py-3 text-sm font-medium text-white opacity-60"
            >
              Pay with Razorpay (Coming Soon)
            </button>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
