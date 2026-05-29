"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { User } from "lucide-react";

const ClerkAuthNav = dynamic(() => import("@/components/clerk-auth-nav"), {
  ssr: false,
});

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function AuthNav() {
  if (!hasClerk) {
    return (
      <Link
        href="/sign-in"
        className="hidden rounded-full p-2 transition hover:bg-black/5 md:inline-flex"
        aria-label="Sign in"
      >
        <User size={20} />
      </Link>
    );
  }

  return <ClerkAuthNav />;
}
