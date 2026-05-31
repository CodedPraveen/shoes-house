"use client";

import { useAuth } from "@clerk/nextjs";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function useAuthSafe() {
  if (!hasClerk) {
    return { isLoaded: true, isSignedIn: false };
  }
  return useAuth();
}
