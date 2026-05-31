"use client";

import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import { formatPrice } from "@/lib/format-price";
import { adminOrders } from "@/data/admin-mock";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export default function OrdersPage() {
  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Orders"
          title="Order history"
          description="Track status and download invoices when available."
        />
        <div className="mx-auto w-full max-w-[1400px] space-y-4 px-5 pb-20 sm:px-8">
          {adminOrders.map((order) => (
            <article
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white p-5"
            >
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-black/60">{order.createdAt}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs capitalize ${statusStyles[order.status]}`}
              >
                {order.status}
              </span>
              <p className="text-sm font-medium">{formatPrice(order.total)}</p>
              <button
                type="button"
                className="rounded-full border border-black/15 px-4 py-2 text-xs transition hover:bg-black hover:text-white"
              >
                Invoice
              </button>
            </article>
          ))}
        </div>
      </main>
    </AuthGate>
  );
}
