import { Search } from "lucide-react";
import LoadingButton from "@/components/ui/loading-button";
import { getUsersPage } from "@/services/new-admin-service";
import { formatPrice } from "@/lib/format-price";
import { EmptyState, MetricCard, PageHeader, StatusBadge, inputClass } from "@/components/new-admin/ui";
import Pagination from "@/components/new-admin/pagination";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Customers" };
export const dynamic = "force-dynamic";

export default async function NewAdminUsersPage({ searchParams }) {
  await requireNewAdminPage();
  const params = await searchParams;
  const data = await getUsersPage(params);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Customers" title="Customer accounts" description="Order counts and realized lifetime spend without exposing sensitive authentication data." />
      <MetricCard label="Matching accounts" value={data.total} />
      <form className="flex max-w-xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input name="q" defaultValue={params.q} className={`${inputClass} pl-9`} placeholder="Name or email" /></label><LoadingButton className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white">Search</LoadingButton></form>
      {data.users.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1.2fr_1.5fr_1fr_.6fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid"><span>Customer</span><span>Contact</span><span>Orders</span><span>Spent</span><span>Last order</span><span>Joined</span></div><div className="divide-y divide-slate-100">{data.users.map((user) => <div key={user.id} className="grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-[1.2fr_1.5fr_1fr_.6fr_1fr_1fr] lg:items-center"><div><p className="font-semibold">{user.name || "Unnamed customer"}</p><StatusBadge tone={user.role === "admin" ? "indigo" : "slate"}>{user.role}</StatusBadge></div><div><p className="break-all">{user.email}</p><p className="text-xs text-slate-400">{user.phone || "No order phone"}</p></div><p><span className="text-slate-400 lg:hidden">Orders · </span>{user._count.orders}</p><p className="font-semibold">{formatPrice(user.totalSpent || 0)}</p><p>{user.lastOrder ? new Date(user.lastOrder).toLocaleDateString("en-IN") : "—"}</p><p>{new Date(user.createdAt).toLocaleDateString("en-IN")}</p></div>)}</div></div> : <EmptyState title="No matching customers" />}
      <Pagination basePath="/new-admin/users" params={params} page={data.page} pageCount={data.pageCount} total={data.total} />
    </div>
  );
}
