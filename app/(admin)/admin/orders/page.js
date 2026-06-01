import { ORDER_STATUSES } from "@/lib/constants";
import { getAdminOrdersAction } from "@/actions/order-actions";
import AdminOrdersClient from "@/components/admin-orders-client";

export const metadata = { title: "Orders | Admin | AERÉ" };

export default async function AdminOrdersPage() {
  let orders = [];
  try {
    orders = await getAdminOrdersAction();
  } catch {
    orders = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-2 text-sm text-black/60">
          Order status: {ORDER_STATUSES.join(" · ")}
        </p>
      </div>
      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
