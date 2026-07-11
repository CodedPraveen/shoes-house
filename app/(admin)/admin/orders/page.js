import { ORDER_STATUSES } from "@/lib/constants";
import { getAdminOrdersAction } from "@/actions/order-actions";
import AdminOrdersClient from "@/components/admin-orders-client";
import { formatPrice } from "@/lib/format-price";

export const metadata = { title: "Orders | Admin | Shoes House" };

export default async function AdminOrdersPage() {
  let orders = [];
  try {
    orders = await getAdminOrdersAction();
  } catch {
    orders = [];
  }
  const paidCount = orders.filter(
    (order) => order.paymentStatus === "PAID",
  ).length;

  const revenue = orders
    .filter((order) => order.paymentStatus === "PAID")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-8">
     
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xs border p-5">
          <p className="text-sm text-black/60">Total Orders</p>
          <p className="mt-2 text-3xl font-semibold">
            {orders.length}
          </p>
        </div>

        <div className="rounded-xs border p-5">
          <p className="text-sm text-black/60">Paid Orders</p>
          <p className="mt-2 text-3xl font-semibold">
            {paidCount}
          </p>
        </div>

        <div className="rounded-xs border p-5">
          <p className="text-sm text-black/60">Revenue</p>
          <p className="mt-2 text-3xl font-semibold">
            {formatPrice(revenue)}
          </p>
        </div>
      </div>
      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
