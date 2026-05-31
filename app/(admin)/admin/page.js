import StatCard from "@/components/admin/stat-card";
import { adminStats } from "@/data/admin-mock";
import { formatPrice } from "@/lib/format-price";

export const metadata = { title: "Admin | AERÉ" };

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-black/60">
          Overview — connect Prisma for live metrics.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={adminStats.totalUsers} />
        <StatCard label="Total Orders" value={adminStats.totalOrders} />
        <StatCard
          label="Total Revenue"
          value={formatPrice(adminStats.totalRevenue)}
        />
        <StatCard label="Total Products" value={adminStats.totalProducts} />
      </div>
    </div>
  );
}
