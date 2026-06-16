import StatCard from "@/components/admin/stat-card";
import { adminStats } from "@/data/admin-mock";
import { formatPrice } from "@/lib/format-price";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin | Shoes House" };

export default async function AdminDashboardPage() {
  const totalProducts = await prisma.product.count();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-black/60">
          Product count is live from Supabase. Other metrics connect in Phase 4+.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={adminStats.totalUsers} />
        <StatCard label="Total Orders" value={adminStats.totalOrders} />
        <StatCard
          label="Total Revenue"
          value={formatPrice(adminStats.totalRevenue)}
        />
        <StatCard label="Total Products" value={totalProducts} />
      </div>
    </div>
  );
}
