import { adminUsers } from "@/data/admin-mock";

export const metadata = { title: "Users | Admin | Shoes House" };

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-2 text-sm text-black/60">
            Search users and view order history — Clerk + Prisma sync.
          </p>
        </div>
        <input
          type="search"
          placeholder="Search users..."
          className="h-11 no54123-full border border-black/15 px-4 text-sm"
        />
      </div>
      <div className="overflow-x-auto no54123-2xl border border-black/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-black/10 bg-zinc-50 text-xs uppercase tracking-wider text-black/45">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-b border-black/5">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.orders}</td>
                <td className="px-4 py-3">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
