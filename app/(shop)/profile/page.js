import Link from "next/link";
import PageHeader from "@/components/page-header";

export const metadata = {
  title: "Profile | AERÉ",
};

async function getProfileUser() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  const { currentUser } = await import("@clerk/nextjs/server");
  return currentUser();
}

export default async function ProfilePage() {
  const user = await getProfileUser();

  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage your AERÉ account and preferences."
      />
      <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8">
        <div className="max-w-lg rounded-3xl border border-black/10 bg-zinc-50 p-8">
          {user ? (
            <>
              <p className="text-sm text-black/60">Signed in as</p>
              <p className="mt-2 text-xl font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-1 text-sm text-black/60">
                {user.emailAddresses?.[0]?.emailAddress}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-black/60">
                Sign in to access your profile and order history.
              </p>
              <Link
                href="/sign-in"
                className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm text-white"
              >
                Sign In
              </Link>
            </>
          )}
          <p className="mt-8 text-sm text-black/50">
            Order history and wishlist will appear here when the database is
            connected.
          </p>
        </div>
      </div>
    </main>
  );
}
