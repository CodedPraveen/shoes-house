import Link from "next/link";
import { Download, Search } from "lucide-react";
import { getOrdersPage } from "@/services/new-admin-service";
import { formatPrice } from "@/lib/format-price";
import {
  EmptyState,
  MetricCard,
  PageHeader,
  inputClass,
} from "@/components/new-admin/ui";
import OrderList from "@/components/new-admin/orders/order-list";
import Pagination from "@/components/new-admin/pagination";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

function queryString(params, overrides = {}) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries({
    ...params,
    ...overrides,
  })) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      search.set(key, String(value));
    }
  }

  return search.toString();
}

export default async function NewAdminOrdersPage({ searchParams }) {
  await requireNewAdminPage();

  const params = await searchParams;
  const data = await getOrdersPage(params);

  const quickFilters = [
    ["New orders", "new", data.attention.waitingConfirmation],
    ["Confirm by call", "confirm", data.attention.waitingConfirmation],
    ["Processing", "processing", data.attention.processing],
    ["Ready to send", "ready_to_send", data.attention.missingTracking],
    ["In transit", "in_transit", data.attention.inTransit],
    ["Delivered today", "delivered_today", null],
    ["COD outstanding", "cod_outstanding", data.attention.codOutstanding],
  ];

  const exportHref = `/new-admin/orders/export?${queryString(params)}`;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Confirm COD orders, attach India Post tracking, monitor delivery, and reconcile realized revenue."
        action={
          <a
            href={exportHref}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"
          >
            <Download className="size-4" />
            Export filtered
          </a>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Total orders"
          value={data.kpis.totalOrders}
        />

        <MetricCard
          label="Delivered"
          value={data.kpis.deliveredOrders}
          tone="emerald"
        />

        <MetricCard
          label="Paid orders"
          value={data.kpis.paidOrders}
        />

        <MetricCard
          label="Unpaid / COD"
          value={data.kpis.codOutstanding}
          tone="amber"
        />

        <MetricCard
          label="Total revenue"
          value={formatPrice(data.kpis.totalRevenue)}
          tone="dark"
        />

        <MetricCard
          label="Paid revenue"
          value={formatPrice(data.kpis.paidRevenue)}
        />

        <MetricCard
          label="COD value"
          value={formatPrice(data.kpis.codRevenue)}
        />

        <MetricCard
          label="COD delivered"
          value={formatPrice(data.kpis.codDeliveredRevenue)}
          tone="emerald"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Link
          href="/new-admin/orders?workflow=confirm"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-xs font-medium text-amber-700">
            Waiting confirmation
          </p>

          <p className="mt-2 text-2xl font-semibold text-amber-950">
            {data.attention.waitingConfirmation}
          </p>
        </Link>

        <Link
          href="/new-admin/orders?workflow=ready_to_send"
          className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"
        >
          <p className="text-xs font-medium text-indigo-700">
            Missing tracking
          </p>

          <p className="mt-2 text-2xl font-semibold text-indigo-950">
            {data.attention.missingTracking}
          </p>
        </Link>

        <Link
          href="/new-admin/orders?workflow=in_transit"
          className="rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <p className="text-xs font-medium text-blue-700">
            In transit
          </p>

          <p className="mt-2 text-2xl font-semibold text-blue-950">
            {data.attention.inTransit}
          </p>
        </Link>

        <Link
          href="/new-admin/orders?workflow=sending"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4"
        >
          <p className="text-xs font-medium text-rose-700">
            Stale tracking
          </p>

          <p className="mt-2 text-2xl font-semibold text-rose-950">
            {data.attention.staleTracking}
          </p>
        </Link>

        <Link
          href="/new-admin/orders?workflow=cod_outstanding"
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          <p className="text-xs font-medium text-slate-500">
            COD awaiting delivery
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {data.attention.codOutstanding}
          </p>
        </Link>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickFilters.map(([label, value, count]) => (
          <Link
            key={value}
            href={`/new-admin/orders?workflow=${value}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm ${params.workflow === value
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white"
              }`}
          >
            {label}
            {count != null ? ` · ${count}` : ""}
          </Link>
        ))}
      </div>

      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[1.5fr_repeat(5,minmax(0,1fr))_auto]"
      >
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />

          <input
            name="q"
            defaultValue={params.q}
            className={`${inputClass} pl-9`}
            placeholder="Order, customer, mobile, tracking"
          />
        </label>

        <select
          name="workflow"
          defaultValue={params.workflow ?? "all"}
          className={inputClass}
        >
          <option value="all">All orders</option>
          <option value="new">New orders</option>
          <option value="confirm">Confirm by call</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="ready_to_send">Ready to send</option>
          <option value="sending">In transit</option>
          <option value="in_transit">Courier in transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="paid">Paid</option>
          <option value="cod">COD</option>
          <option value="payment_issue">
            Payment failed / pending
          </option>
        </select>

        <select
          name="date"
          defaultValue={params.date ?? "all"}
          className={inputClass}
        >
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>

        <input
          type="date"
          name="from"
          defaultValue={params.from}
          aria-label="From date"
          className={inputClass}
        />

        <input
          type="date"
          name="to"
          defaultValue={params.to}
          aria-label="To date"
          className={inputClass}
        />

        <select
          name="limit"
          defaultValue={String(data.pageSize)}
          className={inputClass}
        >
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>

        <button className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-500">
          Apply
        </button>
      </form>

      {data.orders.length ? (
        <OrderList orders={data.orders} />
      ) : (
        <EmptyState
          title="No matching orders"
          description="Try changing the workflow, date range, or search query."
        />
      )}

      <Pagination
        basePath="/new-admin/orders"
        params={params}
        page={data.page}
        pageCount={data.pageCount}
        total={data.total}
      />
    </div>
  );
}