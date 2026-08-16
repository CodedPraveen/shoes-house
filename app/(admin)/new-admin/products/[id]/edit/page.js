import Link from "next/link";
import { notFound } from "next/navigation";

import NewAdminProductForm from "@/components/new-admin/products/product-form";
import { PageHeader } from "@/components/new-admin/ui";
import { productAdminService } from "@/services/product-admin-service";
import { prisma } from "@/lib/db";
import { requireNewAdminPage } from "@/lib/admin-auth";

export const metadata = {
  title: "Edit product",
};

export const dynamic = "force-dynamic";

export default async function NewAdminEditProductPage({
  params,
}) {
  await requireNewAdminPage();

  const { id } = await params;

  const [product, productRecord] = await Promise.all([
    productAdminService.getForEdit(id),

    prisma.product.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        collection: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const collection =
    productRecord?.collection ?? "SHOES";

  const [collections, subCategories] =
    await Promise.all([
      productAdminService.listParentCategories(),
      productAdminService.listSubCategories(
        collection,
      ),
    ]);

  const initial = {
    name: product.name,
    slug: product.slug,
    description: product.description,
    brand: product.brand,
    price: product.price,

    // Product-level inventory.
    // Do not read stock from ProductVariant.
    stock: product.stock ?? 0,

    sizes: product.sizes,
    images: product.images,

    category: product.category,
    collection,

    isNew: product.isNew,
    isTrending: product.isTrending,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Catalog"
        title={`Edit ${product.name}`}
        description="Changes use the existing product service and inventory movement rules."
        action={
          <Link
            href="/new-admin/products"
            className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium"
          >
            Back to products
          </Link>
        }
      />

      <NewAdminProductForm
        mode="edit"
        productId={id}
        initial={initial}
        collections={collections}
        subCategories={subCategories}
      />
    </div>
  );
}