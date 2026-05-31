"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSafe } from "@/hooks/use-auth-safe";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function AuthGate({ children, fallback = null }) {
  const { isLoaded, isSignedIn } = useAuthSafe();
  const router = useRouter();

  useEffect(() => {
    if (!hasClerk) return;
    if (isLoaded && !isSignedIn) {
      router.replace(
        `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`,
      );
    }
  }, [isLoaded, isSignedIn, router]);

  if (!hasClerk) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center text-sm text-black/60">
        Sign in requires Clerk keys in .env.local
      </div>
    );
  }

  if (!isLoaded) {
    return (
      fallback || (
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-black/50">
          Loading...
        </div>
      )
    );
  }

  if (!isSignedIn) return null;

  return children;
}
