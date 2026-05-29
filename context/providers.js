"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/cart-context";
import { SearchProvider } from "@/context/search-context";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function AppProviders({ children }) {
  return (
    <CartProvider>
      <SearchProvider>{children}</SearchProvider>
    </CartProvider>
  );
}

export default function Providers({ children }) {
  if (!clerkKey) {
    return <AppProviders>{children}</AppProviders>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <AppProviders>{children}</AppProviders>
    </ClerkProvider>
  );
}
