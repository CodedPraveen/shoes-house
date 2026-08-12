import Link from "next/link";
import NewAdminProductForm from "@/components/new-admin/products/product-form";
import { PageHeader } from "@/components/new-admin/ui";
import { productAdminService } from "@/services/product-admin-service";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewAdminNewProductPage() {
  await requireNewAdminPage();
  const [collections, subCategories] = await Promise.all([productAdminService.listParentCategories(), productAdminService.listSubCategories("SHOES")]);
  return <div className="space-y-8"><PageHeader eyebrow="Catalog" title="Add product" description="Create a live product using the existing catalog and inventory business logic." action={<Link href="/new-admin/products" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium">Back to products</Link>} /><NewAdminProductForm collections={collections} subCategories={subCategories} /></div>;
}
