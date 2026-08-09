import Link from "next/link";
import { notFound } from "next/navigation";
import SafeImage from "@/components/ui/safe-image";
import OrderActions from "@/components/new-admin/orders/order-actions";
import { PageHeader, StatusBadge } from "@/components/new-admin/ui";
import { getOrderDetail } from "@/services/new-admin-service";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order details" };

export default async function NewAdminOrderDetailPage({ params }) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();
  const payment = order.payments[0];
  const timeline = [
    { label: "Order placed", done: true, date: order.createdAt },
    { label: "Confirmed by call", done: order.confirmedByCall || !order.isCod, date: order.confirmedAt },
    { label: "Tracking added", done: Boolean(order.trackingNumber), date: order.shippedAt },
    { label: "Sending / in transit", done: order.status === "SHIPPED" || order.status === "DELIVERED", date: order.lastTrackingSync },
    { label: "Delivered", done: order.status === "DELIVERED", date: order.deliveredAt },
  ];
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Order detail" title={order.orderNumber} description={`Placed ${new Date(order.createdAt).toLocaleString("en-IN")}`} action={<div className="flex gap-2"><Link href="/new-admin/orders" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium">Back to orders</Link><a href={`/api/orders/${order.id}/invoice`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl bg-slate-950 px-4 text-sm font-medium text-white">View invoice</a></div>} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Customer</h2><p className="mt-4 font-semibold">{order.shipFullName}</p><a href={`tel:${order.shipPhone}`} className="mt-1 block text-indigo-600">{order.shipPhone}</a><p className="mt-1 text-sm text-slate-500">{order.user?.email}</p><p className="mt-3 text-xs text-slate-400">Customer ID · {order.user?.id}</p></section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Shipping address</h2><address className="mt-4 not-italic leading-7 text-slate-700"><p className="font-semibold">{order.shipFullName}</p><p>{order.shipLine1}</p>{order.shipLandmark ? <p>{order.shipLandmark}</p> : null}{order.shipLine2 ? <p>{order.shipLine2}</p> : null}<p>{order.shipCity}, {order.shipState} {order.shipPincode}</p><p>{order.shipCountry}</p></address></section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="font-semibold">Items</h2></div><div className="divide-y divide-slate-100">{order.items.map((item) => <div key={item.id} className="flex gap-4 p-4"><div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"><SafeImage src={item.productImage} alt={item.productName} fill sizes="80px" className="object-cover" /></div><div className="min-w-0 flex-1"><p className="font-medium">{item.productName}</p><p className="mt-1 text-xs text-slate-500">SKU {item.productSku} · {item.color} · Size {item.size}</p><p className="mt-2 text-sm">{item.quantity} × {formatPrice(item.priceAtPurchase)}</p></div><p className="font-semibold">{formatPrice(item.quantity * item.priceAtPurchase)}</p></div>)}</div><div className="space-y-2 border-t border-slate-100 bg-slate-50 p-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shippingCost)}</span></div><div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold"><span>Final total</span><span>{formatPrice(order.total)}</span></div></div></section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Order actions</h2><div className="mt-4"><OrderActions order={order} /></div></section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold">Payment</h2><StatusBadge tone={order.paymentStatus === "PAID" ? "emerald" : order.paymentStatus === "FAILED" ? "rose" : "amber"}>{order.paymentStatus}</StatusBadge></div><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Method</dt><dd className="font-medium">{order.paymentMethod}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Amount</dt><dd className="font-medium">{formatPrice(payment?.amount ?? order.total)}</dd></div>{payment?.razorpayPaymentId ? <div><dt className="text-slate-500">Razorpay payment</dt><dd className="mt-1 break-all font-mono text-xs">{payment.razorpayPaymentId}</dd></div> : null}{payment?.razorpayOrderId ? <div><dt className="text-slate-500">Razorpay order</dt><dd className="mt-1 break-all font-mono text-xs">{payment.razorpayOrderId}</dd></div> : null}</dl>{order.isCod ? <p className={`mt-4 rounded-xl p-3 text-xs ${order.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>{order.status === "DELIVERED" ? "COD revenue is realized." : "COD remains outstanding until delivery."}</p> : null}</section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold">India Post shipment</h2><StatusBadge tone={order.status === "DELIVERED" ? "emerald" : order.trackingNumber ? "blue" : "slate"}>{order.trackingStatus || "Not added"}</StatusBadge></div><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-500">Courier</dt><dd className="font-medium">India Post</dd></div><div><dt className="text-slate-500">Tracking number</dt><dd className="font-mono font-medium">{order.trackingNumber || "—"}</dd></div><div><dt className="text-slate-500">Last sync</dt><dd>{order.lastTrackingSync ? new Date(order.lastTrackingSync).toLocaleString("en-IN") : "—"}</dd></div>{order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-block text-indigo-600">Open tracking page</a> : null}</dl></section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">Timeline</h2><ol className="mt-5 space-y-0">{timeline.map((step, index) => <li key={step.label} className="flex gap-3"><div className="flex flex-col items-center"><span className={`mt-0.5 size-3 rounded-full ${step.done ? "bg-indigo-600" : "bg-slate-200"}`} />{index < timeline.length - 1 ? <span className={`h-12 w-px ${step.done ? "bg-indigo-200" : "bg-slate-200"}`} /> : null}</div><div><p className={step.done ? "font-medium" : "text-slate-400"}>{step.label}</p>{step.date ? <p className="mt-1 text-xs text-slate-400">{new Date(step.date).toLocaleString("en-IN")}</p> : null}</div></li>)}</ol></section>
        </div>
      </div>
    </div>
  );
}
