import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Shoes | Shoes House",
  description: "Browse the complete Shoes House premium sneaker collection.",
};

export default async function ProductsPage() {
  const products = await productService.getAll();

  return <ProductsPageClient initialProducts={products} />;
}
