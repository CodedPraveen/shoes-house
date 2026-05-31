"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "@/context/cart-context";
import { SearchProvider } from "@/context/search-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { RecentlyViewedProvider } from "@/context/recently-viewed-context";

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function CoreProviders({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <RecentlyViewedProvider>
          <SearchProvider>{children}</SearchProvider>
        </RecentlyViewedProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default function AppProviders({ children }) {
  if (!clerkKey) {
    return <CoreProviders>{children}</CoreProviders>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <CoreProviders>{children}</CoreProviders>
    </ClerkProvider>
  );
}
