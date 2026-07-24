import { CartProvider } from "@/context/cart-context";
import ShopShell from "@/components/shop-shell";

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <ShopShell>
        {children}
      </ShopShell>
    </CartProvider>
  );
}