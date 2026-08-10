import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import { PackagePlus, Search } from "lucide-react";
import { getProductsPage } from "@/services/new-admin-service";
import { formatPrice } from "@/lib/format-price";
import { EmptyState, PageHeader, StatusBadge, inputClass } from "@/components/new-admin/ui";
import Pagination from "@/components/new-admin/pagination";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function NewAdminProductsPage({ searchParams }) {
  await requireNewAdminPage();
  const params = await searchParams;
  const data = await getProductsPage(params);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Catalog" title="Products" description="Search, filter, create, and maintain the live product catalog." action={<Link href="/new-admin/products/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white"><PackagePlus className="size-4" />Add product</Link>} />
      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" /><input name="q" defaultValue={params.q} className={`${inputClass} pl-9`} placeholder="Product, brand, or slug" /></label>
        <select name="collection" defaultValue={params.collection ?? ""} className={inputClass}><option value="">All collections</option><option value="SHOES">Shoes</option><option value="JEWELLERY">Jewellery</option></select>
        <select name="category" defaultValue={params.category ?? ""} className={inputClass}><option value="">All categories</option>{data.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select>
        <select name="stock" defaultValue={params.stock ?? ""} className={inputClass}><option value="">All stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
        <button className="h-10 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white">Apply</button>
      </form>

      {data.failedProducts.length ? (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-semibold text-amber-950">Needs Attention</h2>
              <p className="mt-1 text-sm text-amber-800">These products are hidden from storefront lists until their images are fixed.</p>
            </div>
            <StatusBadge tone="amber">{data.failedProducts.length} failed</StatusBadge>
          </div>
          <div className="divide-y divide-amber-200">
            {data.failedProducts.map((product) => (
              <div key={product.id} className="grid gap-3 px-4 py-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-center sm:px-5">
                <div>
                  <p className="font-semibold text-amber-950">{product.name}</p>
                  <p className="mt-1 text-xs text-amber-700">{product.slug}</p>
                </div>
                <p className="text-amber-900">{product.imageValidation.reason}</p>
                <Link href={`/new-admin/products/${product.id}/edit`} className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-center font-medium text-amber-950 hover:bg-amber-100">Fix images</Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {data.products.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {data.products.map((product) => (
              <div key={product.id} className="grid gap-4 p-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center lg:grid-cols-[4rem_1.5fr_1fr_1fr_1fr_auto]">
                <div className="relative size-16 overflow-hidden rounded-xl bg-slate-100"><SafeImage src={product.images[0]?.url} alt={product.name} fill sizes="64px" className="object-cover" /></div>
                <div className="min-w-0"><p className="truncate font-semibold">{product.name}</p><p className="mt-1 text-xs text-slate-500">{product.brand} · {product.collection}</p></div>
                <div className="hidden lg:block"><p className="text-xs text-slate-400">Category</p><p className="text-sm font-medium">{product.category.name}</p></div>
                <div className="hidden lg:block"><p className="text-xs text-slate-400">Price</p><p className="text-sm font-semibold">{formatPrice(product.price)}</p></div>
                <div className="hidden lg:block"><p className="text-xs text-slate-400">Variants</p><p className="text-sm">{product._count.variants}</p></div>
                <div className="flex items-center justify-between gap-3 sm:justify-end"><StatusBadge tone={product.stock === 0 ? "rose" : product.stock <= 5 ? "amber" : "emerald"}>{product.stock} stock</StatusBadge><Link href={`/new-admin/products/${product.id}/edit`} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">Edit</Link></div>
              </div>
            ))}
          </div>
        </div>
      ) : <EmptyState title="No matching products" description="Try a different catalog filter." />}
      <Pagination basePath="/new-admin/products" params={params} page={data.page} pageCount={data.pageCount} total={data.total} />
    </div>
  );
}
