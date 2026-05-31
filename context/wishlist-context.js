"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { WISHLIST_STORAGE_KEY } from "@/lib/constants";

const WishlistContext = createContext(null);

function loadWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
}

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProductIds(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveWishlist(productIds);
  }, [productIds, hydrated]);

  const addToWishlist = useCallback((productId) => {
    setProductIds((prev) =>
      prev.includes(productId) ? prev : [...prev, productId],
    );
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }, []);

  const isInWishlist = useCallback(
    (productId) => productIds.includes(productId),
    [productIds],
  );

  const value = useMemo(
    () => ({
      productIds,
      count: productIds.length,
      hydrated,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    }),
    [
      productIds,
      hydrated,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
    ],
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
