import { requireNewAdminPage } from "@/lib/admin-auth";
import NewAdminShell from "@/components/new-admin/new-admin-shell";

export const metadata = { title: { default: "Operations | Post Mart", template: "%s | Post Mart Operations" } };
export const dynamic = "force-dynamic";

export default async function NewAdminLayout({ children }) {
  const user = await requireNewAdminPage();
  return <NewAdminShell adminName={user.fullName || user.firstName} adminEmail={user.emailAddresses?.[0]?.emailAddress}>{children}</NewAdminShell>;
}
