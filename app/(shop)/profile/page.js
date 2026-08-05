import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import ProfileClient from "@/components/profile-client";
import { productService } from "@/services/product-service";
import { userService } from "@/services/user-service";

export const dynamic = "force-dynamic";

export const metadata = { title: "Profile | Post Mart" };

async function syncClerkUser() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  const { currentUser } = await import("@clerk/nextjs/server");
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  return userService.upsertFromClerk({
    clerkId: clerkUser.id,
    email,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" "),
    role: clerkUser.publicMetadata?.role === "admin" ? "admin" : "customer",
  });
}

export default async function ProfilePage() {
  const dbUser = await syncClerkUser();
  const allProducts = await productService.getAll();

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Account"
          title="Your profile"
          description="Orders, wishlist, and recently viewed."
        />
        <ProfileClient
          user={
            dbUser
              ? {
                  firstName: dbUser.name?.split(" ")[0],
                  lastName: dbUser.name?.split(" ").slice(1).join(" "),
                  emailAddresses: [{ emailAddress: dbUser.email }],
                }
              : null
          }
          allProducts={allProducts}
        />
      </main>
    </AuthGate>
  );
}
