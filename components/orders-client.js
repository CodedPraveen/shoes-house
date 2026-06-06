"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format-price";
import { getMyOrdersAction } from "@/actions/order-actions";

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-zinc-200 text-zinc-700",
};

const paymentStyles = {
  PENDING: "text-amber-700",
  PAID: "text-green-700",
  FAILED: "text-red-600",
  REFUNDED: "text-zinc-600",
};

export default function OrdersClient() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMyOrdersAction();
        if (active) setOrders(data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const processing = searchParams.get("status") === "processing";

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-5 pb-20 sm:px-8">
      {processing ? (
        <p className="rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm text-black/70">
          Payment received — your order will appear here once verified (webhook).
          Refresh in a moment.
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-black/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-black/60">No orders yet.</p>
      ) : (
        orders.map((order) => (
          <article
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/10 bg-white p-5"
          >
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-sm text-black/60">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className={`mt-1 text-xs ${paymentStyles[order.paymentStatus]}`}>
                Payment: {order.paymentStatus}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs capitalize ${statusStyles[order.status]}`}
            >
              {order.status}
            </span>
            <p className="text-sm font-medium">{formatPrice(order.total)}</p>
            <a
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-black/15 px-4 py-2 text-xs transition hover:bg-black hover:text-white"
            >
              Invoice
            </a>
          </article>
        ))
      )}
    </div>
  );
}
