import Link from "next/link";
import AdminProductForm from "@/components/admin/admin-product-form";
import { productAdminService } from "@/services/product-admin-service";

export const metadata = { title: "Add Product | Admin | AERÉ" };

export default async function AdminNewProductPage() {
  const categories = await productAdminService.listCategories();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/products" className="text-sm text-black/50 hover:text-black">
          ← Products
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Add product</h1>
      </div>
      <AdminProductForm mode="create" categories={categories} />
    </div>
  );
}
