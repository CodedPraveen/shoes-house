import { Search } from "lucide-react";
import { getNewsletterPage } from "@/services/new-admin-service";
import { EmptyState, MetricCard, PageHeader, inputClass } from "@/components/new-admin/ui";
import Pagination from "@/components/new-admin/pagination";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Newsletter" };
export const dynamic = "force-dynamic";

export default async function NewAdminNewsletterPage({ searchParams }) {
  await requireNewAdminPage();
  const params = await searchParams;
  const data = await getNewsletterPage(params);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Audience" title="Newsletter subscribers" description="A read-only view of real newsletter subscriptions. No unsupported sending functionality is exposed." />
      <MetricCard label="Active subscribers" value={data.total} />
      <form className="flex max-w-xl gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input name="q" defaultValue={params.q} className={`${inputClass} pl-9`} placeholder="Search subscriber email" /></label><button className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white">Search</button></form>
      {data.subscribers.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="grid grid-cols-[1fr_auto] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Email</span><span>Subscribed</span></div><div className="divide-y divide-slate-100">{data.subscribers.map((subscriber) => <div key={subscriber.id} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-4 text-sm"><span className="break-all font-medium">{subscriber.email}</span><time className="text-slate-500">{new Date(subscriber.createdAt).toLocaleDateString("en-IN")}</time></div>)}</div></div> : <EmptyState title="No matching subscribers" />}
      <Pagination basePath="/new-admin/newsletters-email" params={params} page={data.page} pageCount={data.pageCount} total={data.total} />
    </div>
  );
}
