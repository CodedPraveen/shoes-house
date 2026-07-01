import Link from "next/link";
import StatCard from "@/components/admin/stat-card";
import { adminStats } from "@/data/admin-mock";
import { formatPrice } from "@/lib/format-price";
import { prisma } from "@/lib/db";

export const revalidate = 300;

export const metadata = { title: "Admin | Shoes House" };

export default async function AdminDashboardPage() {
  const [
    totalProducts,
    totalUsers,
    totalOrders,
    totalRevenue,
    totalSubscribers,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
    }),
    prisma.newsletterSubscriber.count({
      where: {
        deletedAt: null,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-black/60">
          Product count is live from Supabase. Other metrics connect in Phase 4+.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/users"
          className="block transition hover:scale-[1.02]"
        >
          <StatCard label="Total Users" value={totalUsers} />
        </Link>
        <Link
          href="/admin/orders"
          className="block transition hover:scale-[1.02]"
        >
          <StatCard label="Total Orders" value={totalOrders} />
        </Link>
        <StatCard
          label="Total Revenue"
          value={formatPrice(totalRevenue?._sum?.total ?? 0)}
        />
        <Link
          href="/admin/products"
          className="block transition hover:scale-[1.02]"
        >
          <StatCard label="Total Products" value={totalProducts} />
        </Link>
        <Link
          href="/admin/newsletters-email"
          className="block transition hover:scale-[1.02]"
        >
          <StatCard label="Total Subscribers" value={totalSubscribers} />
        </Link>
      </div >
    </div >
  );
}
