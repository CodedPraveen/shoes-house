import { CartProvider } from "@/context/cart-context";

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
        {children}
    </CartProvider>
  );
}