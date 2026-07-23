"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import {
  addToCartAction,
  getCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/actions/cart-actions";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { buildCartSummary, optimisticAddItem } from "@/lib/cart-utils";

function loadGuestCart() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  console.log("CartProvider mounted");
  const { isSignedIn, isLoaded } = useAuthSafe();
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const syncLock = useRef(0);

  const applySummary = useCallback((summary) => {
    setItems(summary.items);
  }, []);

  const syncFromServer = useCallback(async () => {
    try {
      const data = await getCartAction();
      applySummary(data);
    } catch {
      setItems([]);
    }
  }, [applySummary]);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      syncFromServer().finally(() => setHydrated(true));
    } else {
      setItems(loadGuestCart());
      setHydrated(true);
    }
  }, [isLoaded, isSignedIn, syncFromServer]);

  useEffect(() => {
    if (hydrated && !isSignedIn) saveGuestCart(items);
  }, [items, hydrated, isSignedIn]);

  const addItem = useCallback(
    async (payload) => {
      const { product, color, size, quantity = 1 } = payload;

      if (isSignedIn) {
        const previous = items;
        setItems(optimisticAddItem(items, payload));
        const lock = ++syncLock.current;
        try {
          const data = await addToCartAction({
            productId: product.id,
            color,
            size,
            quantity,
          });
          if (lock === syncLock.current) applySummary(data);
        } catch {
          if (lock === syncLock.current) setItems(previous);
          throw new Error("Could not add to cart");
        }
        return;
      }

      setItems((prev) => optimisticAddItem(prev, payload));
    },
    [isSignedIn, items, applySummary],
  );

  const removeItem = useCallback(
    async (lineId) => {
      if (isSignedIn) {
        const previous = items;
        setItems((prev) => prev.filter((item) => item.id !== lineId));
        const lock = ++syncLock.current;
        try {
          const data = await removeFromCartAction(lineId);
          if (lock === syncLock.current) applySummary(data);
        } catch {
          if (lock === syncLock.current) setItems(previous);
        }
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== lineId));
    },
    [isSignedIn, items, applySummary],
  );

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      if (quantity < 1) return;

      if (isSignedIn) {
        const previous = items;
        setItems((prev) =>
          prev.map((item) =>
            item.id === lineId ? { ...item, quantity } : item,
          ),
        );
        const lock = ++syncLock.current;
        try {
          const data = await updateCartQuantityAction(lineId, quantity);
          if (lock === syncLock.current) applySummary(data);
        } catch {
          if (lock === syncLock.current) setItems(previous);
        }
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === lineId ? { ...item, quantity } : item,
        ),
      );
    },
    [isSignedIn, items, applySummary],
  );

  const clearCart = useCallback(async () => {
    if (isSignedIn) {
      const { clearCartAction } = await import("@/actions/cart-actions");
      const data = await clearCartAction();
      applySummary(data);
      return;
    }
    setItems([]);
  }, [isSignedIn, applySummary]);

  const value = useMemo(() => {
    const { itemCount, subtotal } = buildCartSummary(items);
    return {
      items,
      itemCount,
      subtotal,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [items, hydrated, addItem, removeItem, updateQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }
  return context;
}
