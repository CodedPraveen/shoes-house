"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { updateOrderStatusAction } from "@/actions/order-actions";

export default function AdminOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);

  async function onStatusChange(orderId, status) {
    await updateOrderStatusAction(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 p-4"
        >
          <div className="min-w-[140px]">
            <p className="font-medium">{order.orderNumber}</p>
            <p className="text-sm text-black/60">{order.customer}</p>
            <p className="text-xs text-black/45">
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <p className="text-sm">{formatPrice(order.total)}</p>
          <p className="text-xs text-black/60">
            Payment:{" "}
            <span className="font-medium">{order.paymentStatus}</span>
            {order.razorpayPaymentId ? (
              <span className="block text-black/45">{order.razorpayPaymentId}</span>
            ) : null}
          </p>
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="h-10 rounded-xl border border-black/15 px-3 text-sm capitalize"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
          >
            Invoice
          </a>
        </div>
      ))}
      {orders.length === 0 ? (
        <p className="text-sm text-black/60">No orders in database yet.</p>
      ) : null}
      <p className="text-xs text-black/45">
        Payment statuses: {PAYMENT_STATUSES.join(" · ")}
      </p>
    </div>
  );
}
