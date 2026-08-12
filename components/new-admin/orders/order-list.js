"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { StatusBadge } from "@/components/new-admin/ui";
import OrderActions from "@/components/new-admin/orders/order-actions";

function toneFor(status) {
  if (status === "Delivered" || status === "PAID") return "emerald";
  if (status === "Cancelled" || status === "FAILED") return "rose";
  if (status === "Sending order" || status === "In transit" || status === "Out for delivery") return "blue";
  if (status === "Confirmed") return "indigo";
  if (status === "Confirm by call" || status === "PENDING") return "amber";
  return "slate";
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function exportSelected(orders) {
  const header = ["Order Number", "Date", "Customer", "Mobile", "Total", "Payment Method", "Payment Status", "Order Status", "Tracking Number", "Tracking Status", "Delivered Date"];
  const rows = orders.map((order) => [order.orderNumber, order.createdAt, order.shipFullName, order.shipPhone, order.total, order.paymentMethod, order.paymentStatus, order.status, order.trackingNumber, order.trackingStatus, order.deliveredAt]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "post-mart-selected-orders.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function OrderList({ orders }) {
  const [selected, setSelected] = useState([]);
  const allSelected = orders.length > 0 && selected.length === orders.length;
  const selectedOrders = orders.filter((order) => selected.includes(order.id));
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <div className="space-y-3">
      {selected.length ? <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm"><span>{selected.length} selected</span><button type="button" onClick={() => exportSelected(selectedOrders)} className="inline-flex items-center gap-2 font-medium text-indigo-700"><Download className="size-4" />Export selected</button></div> : null}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full h-64 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3"><input aria-label="Select all visible orders" type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : orders.map((order) => order.id))} /></th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tracking</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-4"><input aria-label={`Select ${order.orderNumber}`} type="checkbox" checked={selected.includes(order.id)} onChange={() => toggle(order.id)} /></td>
                <td className="px-4 py-4"><Link href={`/new-admin/orders/${order.id}`} className="font-semibold text-slate-950 hover:text-indigo-600">{order.orderNumber}</Link></td>
                <td className="px-4 py-4"><p className="font-medium">{order.shipFullName}</p><a href={`tel:${order.shipPhone}`} className="text-xs text-slate-500 hover:text-indigo-600">{order.shipPhone}</a></td>
                <td className="whitespace-nowrap px-4 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-4"><p>{order._count?.items ?? order.items.length} items</p><p className="max-w-36 truncate text-xs text-slate-400">{order.items.map((item) => item.productName).join(", ")}</p></td>
                <td className="px-4 py-4"><StatusBadge tone={toneFor(order.paymentStatus)}>{order.isCod ? "COD" : order.paymentStatus}</StatusBadge><p className="mt-1 text-xs text-slate-400">{order.paymentStatus}</p></td>
                <td className="px-4 py-4 font-semibold">{formatPrice(order.total)}</td>
                <td className="px-4 py-4"><StatusBadge tone={toneFor(order.workflowLabel)}>{order.workflowLabel}</StatusBadge></td>
                <td className="px-4 py-4"><p className="max-w-28 truncate text-xs font-medium">{order.trackingNumber || "Not added"}</p><p className="mt-1 text-xs text-slate-400">{order.trackingStatus || "—"}</p></td>
                <td className="px-4 py-4"><details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium">Manage</summary><div className="absolute right-0 z-10 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"><div className="mb-3 flex gap-3">
                  <Link href={`/new-admin/orders/${order.id}`} className="text-xs font-medium text-indigo-600">View details</Link>
                  <a href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-600">Invoice</a></div><OrderActions order={order} compact /></div></details></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><input aria-label={`Select ${order.orderNumber}`} type="checkbox" checked={selected.includes(order.id)} onChange={() => toggle(order.id)} /><div><Link href={`/new-admin/orders/${order.id}`} className="font-semibold">{order.orderNumber}</Link><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</p></div></div><p className="font-semibold">{formatPrice(order.total)}</p></div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-slate-400">Customer</p><p className="font-medium">{order.shipFullName}</p><a href={`tel:${order.shipPhone}`} className="text-indigo-600">{order.shipPhone}</a></div><div><p className="text-xs text-slate-400">Payment</p><p>{order.paymentMethod}</p><StatusBadge tone={toneFor(order.paymentStatus)}>{order.paymentStatus}</StatusBadge></div><div><p className="text-xs text-slate-400">Status</p><StatusBadge tone={toneFor(order.workflowLabel)}>{order.workflowLabel}</StatusBadge></div><div><p className="text-xs text-slate-400">Tracking</p><p className="truncate">{order.trackingNumber || "Not added"}</p></div></div>
            <details className="mt-4 border-t border-slate-100 pt-3"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">Manage order <ExternalLink className="size-4" /></summary><div className="mt-3"><OrderActions order={order} compact /></div></details>
          </article>
        ))}
      </div>
    </div>
  );
}
