import ShopShell from "@/components/shop-shell";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }) {
  let allProducts = [];

  try {
    allProducts = await productService.getAll();
  } catch (error) {
    console.error("Failed to load products for layout:", error.message);
  }

  return <ShopShell allProducts={allProducts}>{children}</ShopShell>;
}
