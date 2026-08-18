import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, PackagePlus, ShoppingBag } from "lucide-react";
import { getDashboardData } from "@/services/new-admin-service";
import { formatPrice } from "@/lib/format-price";
import { EmptyState, MetricCard, PageHeader, StatusBadge } from "@/components/new-admin/ui";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function NewAdminDashboardPage() {
  await requireNewAdminPage();
  const data = await getDashboardData();
  const attentionItems = [
    { label: "Orders awaiting call confirmation", value: data.attention.waitingConfirmation, href: "/new-admin/orders?workflow=confirm" },
    { label: "Confirmed orders missing tracking", value: data.attention.missingTracking, href: "/new-admin/orders?workflow=ready_to_send" },
    { label: "Shipments in transit", value: data.attention.inTransit, href: "/new-admin/orders?workflow=in_transit" },
    { label: "Stale tracking updates", value: data.attention.staleTracking, href: "/new-admin/orders?workflow=sending" },
  ];
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Operations" title="Store dashboard" description="Real order, revenue, customer, and inventory signals—calculated directly from the current store data." action={<div className="flex gap-2"><Link href="/new-admin/orders" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium"><ShoppingBag className="size-4" />Orders</Link><Link href="/new-admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"><PackagePlus className="size-4" />Add product</Link></div>} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Realized revenue" value={formatPrice(data.kpis.totalRevenue)} detail="Paid online + delivered COD" tone="dark" />
        <MetricCard label="Total orders" value={data.kpis.totalOrders} detail={`${data.todayKpis.totalOrders} today`} href="/new-admin/orders" />
        <MetricCard label="Delivered" value={data.kpis.deliveredOrders} detail={`${formatPrice(data.kpis.codDeliveredRevenue)} delivered COD`} tone="emerald" href="/new-admin/orders?workflow=delivered" />
        <MetricCard label="COD outstanding" value={formatPrice(data.kpis.codRevenue - data.kpis.codDeliveredRevenue)} detail={`${data.kpis.codOutstanding} orders awaiting delivery`} tone="amber" href="/new-admin/orders?workflow=cod_outstanding" />
        <MetricCard label="Today’s revenue" value={formatPrice(data.todayRevenue)} detail="Payments captured + COD delivered today" />
        <MetricCard label="Products" value={data.productCount} detail="Active catalog products" href="/new-admin/products" />
        <MetricCard label="Low-stock variants" value={data.lowStockCount} detail="Five units or fewer" href="/new-admin/inventory?stock=low" />
        <MetricCard label="Customers" value={data.customerCount} detail="Active customer accounts" href="/new-admin/users" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-semibold">Recent orders</h2><p className="text-sm text-slate-500">Latest store activity</p></div><Link href="/new-admin/orders" className="text-sm font-medium text-indigo-600">View all</Link></div>
          {data.recentOrders.length ? <div className="divide-y divide-slate-100">{data.recentOrders.map((order) => <Link key={order.id} href={`/new-admin/orders/${order.id}`} className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50"><div><p className="font-medium">{order.orderNumber}</p><p className="mt-1 text-xs text-slate-500">{order.shipFullName} · {order._count?.items ?? 0} items</p></div><div className="text-right"><p className="font-semibold">{formatPrice(order.total)}</p><StatusBadge tone={order.status === "DELIVERED" ? "emerald" : order.status === "CANCELLED" ? "rose" : "amber"}>{order.workflowLabel}</StatusBadge></div></Link>)}</div> : <div className="p-5"><EmptyState title="No orders yet" /></div>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-700"><AlertTriangle className="size-5" /></span><div><h2 className="font-semibold">Attention required</h2><p className="text-sm text-slate-500">Operational follow-ups</p></div></div><div className="mt-5 space-y-2">{attentionItems.map((item) => <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm hover:bg-slate-100"><span>{item.label}</span><span className="flex items-center gap-2 font-semibold">{item.value}<ArrowRight className="size-4" /></span></Link>)}</div></section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><PackagePlus className="size-5 text-indigo-600" /><h2 className="font-semibold">Top products</h2></div><div className="mt-4 divide-y divide-slate-100">{data.topProducts.map((product, index) => <div key={product.id} className="flex items-center justify-between py-3 text-sm"><div className="flex items-center gap-3"><span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs font-semibold">{index + 1}</span><div><p className="font-medium">{product.name}</p><p className="text-xs text-slate-400">{product.stock} in stock</p></div></div><span className="font-semibold">{product.purchaseCount} sold</span></div>)}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><Boxes className="size-5 text-amber-600" /><h2 className="font-semibold">Low stock</h2></div>{data.lowStock.length ? <div className="mt-4 divide-y divide-slate-100">{data.lowStock.map((variant) => <Link key={variant.id} href="/new-admin/inventory?stock=low" className="flex items-center justify-between py-3 text-sm"><div><p className="font-medium">{variant.product.name}</p><p className="text-xs text-slate-400">{variant.sku} · Size {variant.size}</p></div><StatusBadge tone={variant.stock === 0 ? "rose" : "amber"}>{variant.stock} left</StatusBadge></Link>)}</div> : <div className="mt-4"><EmptyState title="Stock levels look healthy" /></div>}</section>
      </div>
    </div>
  );
}
