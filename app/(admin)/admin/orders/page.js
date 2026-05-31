import { adminOrders } from "@/data/admin-mock";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatPrice } from "@/lib/format-price";

export const metadata = { title: "Orders | Admin | AERÉ" };

export default function AdminOrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-sm text-black/60">
          Update status: {ORDER_STATUSES.join(", ")}
        </p>
      </div>
      <div className="space-y-3">
        {adminOrders.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/10 p-4"
          >
            <div className="min-w-[120px]">
              <p className="font-medium">{order.id}</p>
              <p className="text-sm text-black/60">{order.customer}</p>
            </div>
            <p className="text-sm">{formatPrice(order.total)}</p>
            <select
              defaultValue={order.status}
              className="h-10 rounded-xl border border-black/15 px-3 text-sm capitalize"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
