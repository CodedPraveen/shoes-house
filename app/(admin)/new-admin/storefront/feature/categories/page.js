import Link from "next/link";

import { CreateCategoryForm, EditCategoryForm } from "@/components/new-admin/categories/category-form";
import { EmptyState, PageHeader, StatusBadge } from "@/components/new-admin/ui";
import { requireNewAdminPage } from "@/lib/admin-auth";
import { categoryAdminService } from "@/services/category-admin-service";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoryManagementPage({ searchParams }) {
  await requireNewAdminPage();

  const params = await searchParams;
  const collection = params.collection === "JEWELLERY" ? "JEWELLERY" : "SHOES";
  const categories = await categoryAdminService.list(collection);
  const collectionLabel = collection === "JEWELLERY" ? "Jewellery" : "Shoes";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Storefront features"
        title="Categories"
        description="Manage the same database categories used by Product Create and Edit. Category slugs and product relationships stay unchanged when names are edited."
        action={
          <Link
            href="/new-admin/storefront"
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium"
          >
            Back to storefront
          </Link>
        }
      />

      <div className="flex gap-2">
        <Link
          href="/new-admin/storefront/feature/categories?collection=SHOES"
          className={`rounded-xl px-4 py-2 text-sm ${collection === "SHOES" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}
        >
          Shoes
        </Link>
        <Link
          href="/new-admin/storefront/feature/categories?collection=JEWELLERY"
          className={`rounded-xl px-4 py-2 text-sm ${collection === "JEWELLERY" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}
        >
          Jewellery
        </Link>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">Add {collectionLabel} category</h2>
        <p className="mt-1 text-sm text-slate-500">
          A new record is appended to the current category list. Existing categories are not replaced or modified.
        </p>
        <div className="mt-5">
          <CreateCategoryForm key={`${collection}-${categories.length}`} collection={collection} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{collectionLabel} categories</h2>
            <p className="mt-1 text-sm text-slate-500">{categories.length} active categories</p>
          </div>
          <StatusBadge tone="indigo">Database managed</StatusBadge>
        </div>

        {categories.length ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {categories.map((category) => (
              <article key={category.id} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-950">{category.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">/{category.slug}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {category._count.products} {category._count.products === 1 ? "product" : "products"}
                  </p>
                </div>
                <EditCategoryForm category={category} />
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="No categories yet" description={`Add the first ${collectionLabel.toLowerCase()} category above.`} />
          </div>
        )}
      </section>
    </div>
  );
}
