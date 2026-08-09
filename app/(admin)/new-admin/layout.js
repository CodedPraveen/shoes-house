import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import NewAdminShell from "@/components/new-admin/new-admin-shell";

export const metadata = { title: { default: "Operations | Post Mart", template: "%s | Post Mart Operations" } };
export const dynamic = "force-dynamic";

export default async function NewAdminLayout({ children }) {
  let user = null;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/sign-in?redirect_url=/new-admin");
  }
  return <NewAdminShell adminName={user.fullName || user.firstName} adminEmail={user.emailAddresses?.[0]?.emailAddress}>{children}</NewAdminShell>;
}
