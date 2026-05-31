import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import ProfileClient from "@/components/profile-client";

export const metadata = { title: "Profile | AERÉ" };

async function getUser() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  const { currentUser } = await import("@clerk/nextjs/server");
  return currentUser();
}

export default async function ProfilePage() {
  const user = await getUser();

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Account"
          title="Your profile"
          description="Orders, wishlist, and recently viewed."
        />
        <ProfileClient user={user} />
      </main>
    </AuthGate>
  );
}
