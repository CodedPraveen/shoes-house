"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { RECENTLY_VIEWED_KEY } from "@/lib/constants";

const RecentlyViewedContext = createContext(null);
const MAX_ITEMS = 8;

function loadRecent() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function RecentlyViewedProvider({ children }) {
  const [productIds, setProductIds] = useState([]);

  useEffect(() => {
    queueMicrotask(() => setProductIds(loadRecent()));
  }, []);

  const trackView = useCallback((productId) => {
    setProductIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(
        0,
        MAX_ITEMS,
      );
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ productIds, trackView }),
    [productIds, trackView],
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewedContext() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) {
    throw new Error(
      "useRecentlyViewedContext must be used within RecentlyViewedProvider",
    );
  }
  return ctx;
}
