"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import { addToCartAction, clearCartAction, getCartAction, removeFromCartAction, updateCartQuantityAction, } from "@/actions/cart-actions";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { buildCartSummary, optimisticAddItem } from "@/lib/cart-utils";

function loadGuestCart() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuthSafe();

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [useServerCart, setUseServerCart] = useState(false);

  const syncLock = useRef(0);

  const applySummary = useCallback((summary) => {
    setItems(summary.items || []);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    let active = true;

    async function initializeCart() {
      const guestItems = loadGuestCart();

      if (isSignedIn) {
        try {
          const data = await getCartAction();

          if (!active) return;

          // Preserve the browser cart if the database cart is empty.
          if (data.items?.length || !guestItems.length) {
            setItems(data.items || []);
            setUseServerCart(true);
          } else {
            setItems(guestItems);
            setUseServerCart(false);
          }
        } catch {
          if (!active) return;
          setItems(guestItems);
          setUseServerCart(false);
        }
      } else {
        setItems(guestItems);
        setUseServerCart(false);
      }

      if (active) setHydrated(true);
    }

    initializeCart();

    return () => {
      active = false;
    };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (hydrated && !useServerCart) {
      saveGuestCart(items);
    }
  }, [items, hydrated, useServerCart]);

  const addItem = useCallback(
    async (payload) => {
      if (!hydrated) return;

      if (!useServerCart) {
        setItems((previous) => optimisticAddItem(previous, payload));
        return;
      }

      const previous = items;
      setItems((current) => optimisticAddItem(current, payload));

      const lock = ++syncLock.current;

      try {
        const data = await addToCartAction({
          productId: payload.product.id,
          size: payload.size,
          quantity: payload.quantity || 1,
        });

        if (lock === syncLock.current) applySummary(data);
      } catch {
        if (lock === syncLock.current) {
          setUseServerCart(false);
          setItems((current) => {
            const optimistic = optimisticAddItem(previous, payload);
            saveGuestCart(optimistic);
            return optimistic;
          });
        }
      }
    },
    [hydrated, useServerCart, items, applySummary],
  );

  const removeItem = useCallback(
    async (lineId) => {
      if (!useServerCart) {
        setItems((previous) =>
          previous.filter((item) => item.id !== lineId),
        );
        return;
      }

      const previous = items;
      setItems((current) =>
        current.filter((item) => item.id !== lineId),
      );

      const lock = ++syncLock.current;

      try {
        const data = await removeFromCartAction(lineId);
        if (lock === syncLock.current) applySummary(data);
      } catch {
        if (lock === syncLock.current) {
          setUseServerCart(false);
          saveGuestCart(
            previous.filter((item) => item.id !== lineId),
          );
        }
      }
    },
    [useServerCart, items, applySummary],
  );

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      if (quantity < 1) return;

      if (!useServerCart) {
        setItems((previous) =>
          previous.map((item) =>
            item.id === lineId ? { ...item, quantity } : item,
          ),
        );
        return;
      }

      const previous = items;

      setItems((current) =>
        current.map((item) =>
          item.id === lineId ? { ...item, quantity } : item,
        ),
      );

      const lock = ++syncLock.current;

      try {
        const data = await updateCartQuantityAction(lineId, quantity);
        if (lock === syncLock.current) applySummary(data);
      } catch {
        if (lock === syncLock.current) {
          setUseServerCart(false);
          saveGuestCart(
            previous.map((item) =>
              item.id === lineId ? { ...item, quantity } : item,
            ),
          );
        }
      }
    },
    [useServerCart, items, applySummary],
  );

  const clearCart = useCallback(async () => {
    setItems([]);
    saveGuestCart([]);

    if (useServerCart) {
      try {
        await clearCartAction();
      } catch (error) {
        console.error("Could not clear server cart:", error);
      }
    }
  }, [useServerCart]);

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
  }, [
    items,
    hydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within CartProvider");
  }

  return context;
}
