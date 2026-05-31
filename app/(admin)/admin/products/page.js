import Link from "next/link";
import { getAdminProducts } from "@/data/admin-mock";
import { formatPrice } from "@/lib/format-price";

export const metadata = { title: "Products | Admin | AERÉ" };

export default function AdminProductsPage() {
  const products = getAdminProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-black/60">
            Add, edit, delete — wire to Prisma + image upload service.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-black px-5 py-2.5 text-sm text-white"
        >
          Add Product
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-black/10">
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
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/product/${p.id}`}
                    className="mr-3 text-black/60 hover:text-black"
                  >
                    View
                  </Link>
                  <button type="button" className="text-black/60 hover:text-black">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-black/45">
        Fields: name, brand, description, category, price, discount, stock,
        sizes, colors, images — form UI ready for API connection.
      </p>
    </div>
  );
}
