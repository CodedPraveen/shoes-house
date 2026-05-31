import { getAdminProducts, getLowStockProducts } from "@/data/admin-mock";

export const metadata = { title: "Inventory | Admin | AERÉ" };

export default function AdminInventoryPage() {
  const lowStock = getLowStockProducts();
  const all = getAdminProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-2 text-sm text-black/60">
          Update stock, flag out of stock — sync with Prisma Product.stock.
        </p>
      </div>
      {lowStock.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-medium text-amber-900">Low stock alert</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900/80">
            {lowStock.map((p) => (
              <li key={p.id}>
                {p.name} — {p.stock} left
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="space-y-3">
        {all.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/10 px-4 py-3"
          >
            <span className="font-medium">{p.name}</span>
            <input
              type="number"
              defaultValue={p.stock}
              className="h-10 w-24 rounded-xl border border-black/15 px-3 text-sm"
              aria-label={`Stock for ${p.name}`}
            />
            <span className="text-xs uppercase tracking-wider text-black/45">
              {p.status.replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
