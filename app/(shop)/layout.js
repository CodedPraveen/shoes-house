import { CartProvider } from "@/context/cart-context";
import ShopShell from "@/components/shop-shell";
import WhatsAppFloatingButton from "@/components/ui/whatsapp-floating-button";

export default function ShopLayout({ children }) {
  return (
    <CartProvider>
      <ShopShell>
        {children}
        <WhatsAppFloatingButton />
      </ShopShell>
    </CartProvider>
  );
}