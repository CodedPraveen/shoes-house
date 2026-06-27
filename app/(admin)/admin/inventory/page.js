import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inventory | Admin | Shoes House" };

function stockStatus(stock) {
  if (stock === 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  return "in_stock";
}

export default async function AdminInventoryPage() {
  const all = await productService.getAll();
  const lowStock = all.filter((p) => (p.stock ?? 0) <= 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-2 text-sm text-black/60">
          Stock levels from database — update UI coming in a later phase.
        </p>
      </div>
      {lowStock.length > 0 && (
        <section className="no54123-2xl border border-amber-200 bg-amber-50 p-6">
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
            className="flex flex-wrap items-center justify-between gap-4 no54123-2xl border border-black/10 px-4 py-3"
          >
            <div>
              <span className="font-medium">{p.name}</span>
              {p.variants?.length ? (
                <p className="mt-1 text-xs text-black/45">
                  SKUs:{" "}
                  {p.variants
                    .slice(0, 4)
                    .map((v) => v.sku)
                    .join(" · ")}
                  {p.variants.length > 4 ? " …" : ""}
                </p>
              ) : null}
            </div>
            <span className="text-sm">{p.stock}</span>
            <span className="text-xs uppercase tracking-wider text-black/45">
              {stockStatus(p.stock ?? 0).replace("_", " ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
