import Link from "next/link";
import { productService } from "@/services/product-service";
import { formatPrice } from "@/lib/format-price";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products | Admin | Post Mart" };

export default async function AdminProductsPage() {
  const products = await productService.getAll({ includeInvalid: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-black/60">
            Live inventory from Supabase via Prisma.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="no54123-full bg-black px-5 py-2.5 text-sm text-white"
        >
          Add Product
        </Link>
      </div>
      <div className="overflow-x-auto no54123-2xl border border-black/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs uppercase tracking-wider text-black/45">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 capitalize">{p.category}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">{p.stock ?? "—"}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${p.collection.toLowerCase()}/product/${p.slug}`}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-black/60 hover:text-black"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
