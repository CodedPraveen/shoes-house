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
  addToCartAction,
  getCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/actions/cart-actions";
import { CART_STORAGE_KEY } from "@/lib/constants";

const CartContext = createContext(null);

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

function buildGuestLineId(productId, color, size) {
  return `${productId}-${color}-${size}`;
}

export function CartProvider({ children }) {
  const { isSignedIn, isLoaded } = useAuthSafe();
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const syncFromServer = useCallback(async () => {
    try {
      const data = await getCartAction();
      setItems(data.items);
    } catch {
      setItems([]);
    }
  }, []);

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
        const data = await addToCartAction({
          productId: product.id,
          color,
          size,
          quantity,
        });
        setItems(data.items);
        return;
      }

      const lineId = buildGuestLineId(product.id, color, size);
      setItems((prev) => {
        const existing = prev.find((item) => item.id === lineId);
        if (existing) {
          return prev.map((item) =>
            item.id === lineId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            color,
            size,
            quantity,
          },
        ];
      });
    },
    [isSignedIn],
  );

  const removeItem = useCallback(
    async (lineId) => {
      if (isSignedIn) {
        const data = await removeFromCartAction(lineId);
        setItems(data.items);
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== lineId));
    },
    [isSignedIn],
  );

  const updateQuantity = useCallback(
    async (lineId, quantity) => {
      if (quantity < 1) return;
      if (isSignedIn) {
        const data = await updateCartQuantityAction(lineId, quantity);
        setItems(data.items);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.id === lineId ? { ...item, quantity } : item,
        ),
      );
    },
    [isSignedIn],
  );

  const clearCart = useCallback(async () => {
    if (isSignedIn) {
      const { clearCartAction } = await import("@/actions/cart-actions");
      const data = await clearCartAction();
      setItems(data.items);
      return;
    }
    setItems([]);
  }, [isSignedIn]);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

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
