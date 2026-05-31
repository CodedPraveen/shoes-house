import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { isAdminUser } from "@/lib/auth";

async function getAdminUser() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  const { currentUser } = await import("@clerk/nextjs/server");
  return currentUser();
}

export default async function AdminLayout({ children }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  if (!isAdminUser(user)) {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-white">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
