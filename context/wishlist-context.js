"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import {
  getWishlistIdsAction,
  toggleWishlistAction,
} from "@/actions/wishlist-actions";
import { WISHLIST_STORAGE_KEY } from "@/lib/constants";

const WishlistContext = createContext(null);

function loadGuestWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestWishlist(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuthSafe();
  const [productIds, setProductIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      if (isSignedIn) {
        getWishlistIdsAction()
          .then((ids) => { if (active) setProductIds(ids); })
          .catch(() => { if (active) setProductIds([]); })
          .finally(() => { if (active) setHydrated(true); });
      } else {
        setProductIds(loadGuestWishlist());
        setHydrated(true);
      }
    });

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (hydrated && !isSignedIn) saveGuestWishlist(productIds);
  }, [productIds, hydrated, isSignedIn]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (isSignedIn) {
        const result = await toggleWishlistAction(productId);
        setProductIds(result.productIds);
        return result.added;
      }

      setProductIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        return next;
      });
      return !productIds.includes(productId);
    },
    [isSignedIn, productIds],
  );

  const isInWishlist = useCallback(
    (productId) => productIds.includes(productId),
    [productIds],
  );

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.length,
      hydrated,
      toggleWishlist,
      isInWishlist,
    }),
    [productIds, hydrated, toggleWishlist, isInWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlistContext must be used within WishlistProvider");
  }
  return ctx;
}
