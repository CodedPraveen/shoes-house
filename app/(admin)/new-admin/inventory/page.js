import { Search } from "lucide-react";
import { getInventoryPage } from "@/services/new-admin-service";
import { EmptyState, MetricCard, PageHeader, StatusBadge, inputClass } from "@/components/new-admin/ui";
import Pagination from "@/components/new-admin/pagination";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function NewAdminInventoryPage({ searchParams }) {
  await requireNewAdminPage();
  const params = await searchParams;
  const data = await getInventoryPage(params);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Stock control" title="Inventory" description="Variant-level stock visibility using the existing product variants and inventory movement model." />
      <section className="grid gap-4 sm:grid-cols-3"><MetricCard label="Matching variants" value={data.total} /><MetricCard label="Low stock" value={data.lowStock} tone="amber" href="/new-admin/inventory?stock=low" /><MetricCard label="Out of stock" value={data.outOfStock} href="/new-admin/inventory?stock=out" /></section>
      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_1fr_auto]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input name="q" defaultValue={params.q} className={`${inputClass} pl-9`} placeholder="Product name or SKU" /></label><select name="stock" defaultValue={params.stock ?? ""} className={inputClass}><option value="">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="in">In stock</option></select><button className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white">Apply</button></form>
      {data.variants.length ? <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1.4fr_1fr_.6fr_.8fr_.6fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"><span>Product</span><span>Variant</span><span>Size</span><span>Color</span><span>Stock</span></div><div className="divide-y divide-slate-100">{data.variants.map((variant) => { const color = variant.product.colors.find((item) => item.colorKey === variant.colorKey); return <div key={variant.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1.4fr_1fr_.6fr_.8fr_.6fr] md:items-center"><div><p className="font-semibold">{variant.product.name}</p><p className="text-xs text-slate-400 md:hidden">{variant.sku}</p></div><p className="hidden font-mono text-xs md:block">{variant.sku}</p><p><span className="text-slate-400 md:hidden">Size · </span>{variant.size}</p><div className="flex items-center gap-2"><span className="size-3 rounded-full border" style={{ backgroundColor: color?.hex || variant.colorKey }} /><span>{color?.label || variant.colorKey}</span></div><StatusBadge tone={variant.stock === 0 ? "rose" : variant.stock <= 5 ? "amber" : "emerald"}>{variant.stock}</StatusBadge></div>; })}</div></div> : <EmptyState title="No inventory matches" />}
      <Pagination basePath="/new-admin/inventory" params={params} page={data.page} pageCount={data.pageCount} total={data.total} />
    </div>
  );
}
