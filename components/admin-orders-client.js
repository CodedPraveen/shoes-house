"use client";

import { useRef, useState } from "react";
import { formatPrice } from "@/lib/format-price";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { updateOrderStatusAction } from "@/actions/order-actions";

export default function AdminOrdersClient({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const [errors, setErrors] = useState({});
  const updatingRef = useRef(new Set());

  async function onStatusChange(orderId, status) {
    if (updatingRef.current.has(orderId)) return;
    updatingRef.current.add(orderId);
    setUpdatingIds(new Set(updatingRef.current));
    setErrors((current) => ({ ...current, [orderId]: "" }));
    try {
      await updateOrderStatusAction(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [orderId]: error?.message || "Could not update this order.",
      }));
    } finally {
      updatingRef.current.delete(orderId);
      setUpdatingIds(new Set(updatingRef.current));
    }
  }
  function getStatusColor(status) {
    switch (status) {
      case "PENDING":
        return "bg-zinc-100 text-zinc-700";

      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-700";

      case "PROCESSING":
        return "bg-yellow-100 text-yellow-700";

      case "READY_TO_SEND":
        return "bg-violet-100 text-violet-700";

      case "SHIPPED":
        return "bg-blue-100 text-blue-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";
    }
  }

  return (
    <div className="overflow-hidden rounded-xs border border-black/10 bg-white shadow-sm">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-xs flex flex-col gap-4 border-b border-black/10 p-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex-1">
            <p className="font-semibold tracking-wide">
              {order.orderNumber}
            </p>
            <p className="mt-1 text-xs text-black/45">
              ID: {order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-black/60">
              {order.customer}
            </p>

            <p className="text-xs text-black/45">
              {new Date(order.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
          <p className="text-lg font-semibold">
            {formatPrice(order.total)}
          </p>
          <div className="min-w-[170px] text-xs text-black/60">
            Payment:{" "}
            <span
              className={`rounded-xs px-3 py-1 text-xs font-medium ${order.paymentStatus === "PAID"
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
                }`}
            >
              {order.paymentStatus}
            </span>
            {order.razorpayPaymentId ? (
              <span className="block text-black/45">{order.razorpayPaymentId}</span>
            ) : null}
          </div>
          <div className="min-w-[190px]">
          <div className="flex items-center gap-2">
          {updatingIds.has(order.id) ? <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden /> : null}
          <select
            value={order.status}
            disabled={updatingIds.has(order.id)}
            aria-busy={updatingIds.has(order.id) || undefined}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className={`
    h-10 rounded-xs border px-3 text-sm font-medium capitalize
    focus:outline-none focus:ring-2 focus:ring-black/20
    ${getStatusColor(order.status)}
  `}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          </div>
          {errors[order.id] ? <p className="mt-1 text-xs text-red-600" role="alert">{errors[order.id]}</p> : null}
          </div>
         
          <div className="flex gap-2">

            <a
              href={`/admin/orders/${order.id}`}
              className="inline-flex h-10 items-center rounded-xs border border-black/10 px-4 text-sm hover:bg-black hover:text-white transition"
            >
              Manage
            </a>

            <a
              href={`/api/orders/${order.id}/invoice`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-xs border border-black/10 px-4 text-sm hover:bg-black hover:text-white transition"
            >
              Invoice
            </a>

          </div>
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
