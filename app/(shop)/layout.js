import ShopShell from "@/components/shop-shell";

export default function ShopLayout({ children }) {
  return (
    <ShopShell collection="SHOES">
      {children}
    </ShopShell>
  );
}