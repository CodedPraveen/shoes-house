"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function ClerkAuthNav() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <span className="hidden h-9 w-9 md:block" />;
  }

  if (isSignedIn) {
    return <UserButton afterSignOutUrl="/" />;
  }
  return (
    <Link
      href="/sign-in"
      className="hidden no54123-full p-2 transition hover:bg-black/5 md:inline-flex"
      aria-label="Sign in"
    >
      <User size={20} />
    </Link>
  );
}
