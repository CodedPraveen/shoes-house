import Link from "next/link";
import { requireNewAdminPage } from "@/lib/admin-auth";
import { getStorefrontAdminData, targetHref } from "@/services/storefront-service";
import { PageHeader, buttonClass, inputClass } from "@/components/new-admin/ui";
import {
  createStorefrontProductSectionAction,
  disableStorefrontSectionItemAction,
  moveStorefrontProductSectionAction,
  reorderStorefrontSectionItemAction,
  saveHeroSlideAction,
  saveNavbarItemAction,
  saveStorefrontSectionAction,
  saveStorefrontSectionItemAction,
} from "@/actions/storefront-admin-actions";
import LoadingButton from "@/components/ui/loading-button";
import StorefrontTargetFields from "@/components/new-admin/storefront-target-fields";

export const metadata = { title: "Storefront" };
export const dynamic = "force-dynamic";

function HiddenCollection({ collection }) {
  return <input type="hidden" name="collection" value={collection} />;
}

export default async function StorefrontAdminPage({ searchParams }) {
  await requireNewAdminPage();
  const params = await searchParams;
  const collection = params.collection === "JEWELLERY" ? "JEWELLERY" : "SHOES";
  const data = await getStorefrontAdminData(collection);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Content management" title="Storefront" description="Manage homepage product sections, campaign imagery, and navigation without changing storefront code." action={<div className="flex gap-2"><Link href="/new-admin/storefront?collection=SHOES" className={`rounded-xl px-4 py-2 text-sm ${collection === "SHOES" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}>Shoes</Link><Link href="/new-admin/storefront?collection=JEWELLERY" className={`rounded-xl px-4 py-2 text-sm ${collection === "JEWELLERY" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}>Jewellery</Link></div>} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Homepage product sections</h2>
        <p className="mt-1 text-sm text-slate-500">Product sections appear after the fixed hero in the order shown here.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {data.productSections.map((section, index) => (
            <div key={section.key} className="rounded-xl border border-slate-200 p-4">
              <form action={saveStorefrontSectionAction} className="grid gap-3 sm:grid-cols-2">
                <HiddenCollection collection={collection} /><input type="hidden" name="key" value={section.key} />
                <div className="sm:col-span-2 flex items-center justify-between"><p className="font-semibold">Product section</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={section.enabled} />Enabled</label></div>
                <input name="title" defaultValue={section.title} className={inputClass} aria-label={`${section.key} title`} />
                <input name="subtitle" defaultValue={section.subtitle || ""} className={inputClass} placeholder="Optional subtitle" />
                <LoadingButton className={`${buttonClass} sm:col-span-2`}>Save section</LoadingButton>
              </form>

              <div className="mt-3 flex gap-2">
                <form action={moveStorefrontProductSectionAction}><HiddenCollection collection={collection} /><input type="hidden" name="key" value={section.key} /><input type="hidden" name="direction" value="up" /><LoadingButton disabled={index === 0} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40">Move up</LoadingButton></form>
                <form action={moveStorefrontProductSectionAction}><HiddenCollection collection={collection} /><input type="hidden" name="key" value={section.key} /><input type="hidden" name="direction" value="down" /><LoadingButton disabled={index === data.productSections.length - 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40">Move down</LoadingButton></form>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Selected products</p>
                <div className="space-y-2">{section.items?.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="min-w-0 flex-1 truncate">{item.product?.name || "Unavailable product"}</span><form action={reorderStorefrontSectionItemAction} className="flex items-center gap-2"><HiddenCollection collection={collection} /><input type="hidden" name="id" value={item.id} /><input type="number" name="sortOrder" defaultValue={item.sortOrder} className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-xs" aria-label="Product order" /><LoadingButton className="text-xs font-medium text-indigo-600">Save order</LoadingButton></form><form action={disableStorefrontSectionItemAction}><HiddenCollection collection={collection} /><input type="hidden" name="id" value={item.id} /><LoadingButton className="text-xs font-medium text-rose-600">Remove</LoadingButton></form></div>)}</div>
                <form action={saveStorefrontSectionItemAction} className="mt-3 grid gap-2 sm:grid-cols-2">
                  <HiddenCollection collection={collection} /><input type="hidden" name="key" value={section.key} />
                  <select name="productId" className={`${inputClass} sm:col-span-2`} required><option value="">Choose product</option>{data.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
                  <LoadingButton className={`${buttonClass} sm:col-span-2`}>Add product</LoadingButton>
                </form>
              </div>
            </div>
          ))}
          <form action={createStorefrontProductSectionAction} className="grid gap-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4 sm:grid-cols-2">
            <HiddenCollection collection={collection} />
            <p className="font-semibold sm:col-span-2">Add product section</p>
            <input name="title" className={inputClass} placeholder="Section title" required />
            <input name="subtitle" className={inputClass} placeholder="Optional subtitle" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked />Enabled</label>
            <LoadingButton className={buttonClass}>Add section</LoadingButton>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Hero slides</h2>
        <p className="mt-1 text-sm text-slate-500">Uploads are routed by the server to postmart/storefront/hero.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {data.slides.map((slide) => (
            <form key={slide.id} action={saveHeroSlideAction} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              <HiddenCollection collection={collection} /><input type="hidden" name="id" value={slide.id} />
              <a href={slide.mediaAsset.url} target="_blank" rel="noreferrer" className="truncate text-xs text-indigo-600 sm:col-span-2">Current image</a>
              <input name="alt" defaultValue={slide.alt} className={inputClass} placeholder="Alt text" required />
              <input type="number" name="sortOrder" defaultValue={slide.sortOrder} className={inputClass} aria-label="Slide order" />
              <StorefrontTargetFields categories={data.categories} products={data.products} item={slide} />
              <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="text-sm sm:col-span-2" multiple={true} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={slide.enabled} />Enabled</label>
              <LoadingButton className={buttonClass}>Save slide</LoadingButton>
              <p className="text-xs text-slate-500 sm:col-span-2">Destination: {targetHref(slide, collection)}</p>
            </form>
          ))}
          <form action={saveHeroSlideAction} className="grid gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4 sm:grid-cols-2">
            <HiddenCollection collection={collection} />
            <p className="font-semibold sm:col-span-2">Add hero slide</p>
            <input name="alt" className={inputClass} placeholder="Descriptive alt text" required />
            <input type="number" name="sortOrder" defaultValue={data.slides.length} className={inputClass} aria-label="Slide order" />
            <StorefrontTargetFields categories={data.categories} products={data.products} />
            <input type="file" name="image" required accept="image/jpeg,image/png,image/webp" className="text-sm sm:col-span-2" multiple={true} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked />Enabled</label>
            <LoadingButton className={buttonClass}>Add slide</LoadingButton>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Navbar items</h2>
        <p className="mt-1 text-sm text-slate-500">Entity destinations use current slugs, so category and product links stay valid after edits.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {data.navbarItems.map((item) => <form key={item.id} action={saveNavbarItemAction} className="grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-2"><HiddenCollection collection={collection} /><input type="hidden" name="id" value={item.id} /><input name="label" defaultValue={item.label} className={inputClass} required /><input type="number" name="sortOrder" defaultValue={item.sortOrder} className={inputClass} /><StorefrontTargetFields categories={data.categories} products={data.products} item={item} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked={item.enabled} />Enabled</label><LoadingButton className={buttonClass}>Save item</LoadingButton></form>)}
          <form action={saveNavbarItemAction} className="grid gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 p-4 sm:grid-cols-2"><HiddenCollection collection={collection} /><p className="font-semibold sm:col-span-2">Add navigation item</p><input name="label" className={inputClass} placeholder="Label" required /><input type="number" name="sortOrder" defaultValue={data.navbarItems.length} className={inputClass} /><StorefrontTargetFields categories={data.categories} products={data.products} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="enabled" defaultChecked />Enabled</label><LoadingButton className={buttonClass}>Add item</LoadingButton></form>
        </div>
      </section>
    </div>
  );
}
