import Link from "next/link";
import { notFound } from "next/navigation";
import AdminProductForm from "@/components/admin/admin-product-form";
import { productAdminService } from "@/services/product-admin-service";

export const metadata = { title: "Edit Product | Admin | AERÉ" };

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    productAdminService.getForEdit(id),
    productAdminService.listCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="text-sm text-black/50 hover:text-black">
          ← Products
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit product</h1>
        <p className="mt-1 text-sm text-black/60">{product.name}</p>
      </div>
      <AdminProductForm
        mode="edit"
        productId={id}
        initial={product}
        categories={categories}
      />
    </div>
  );
}
