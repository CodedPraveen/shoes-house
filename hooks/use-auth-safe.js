"use client";

import { useAuth } from "@clerk/nextjs";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function useClerkAuth() {
  return useAuth();
}

function useGuestAuth() {
  return { isLoaded: true, isSignedIn: false };
}

export const useAuthSafe = hasClerk ? useClerkAuth : useGuestAuth;
