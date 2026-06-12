import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const revalidate = 120;

export const metadata = {
  title: "All Shoes | AERÉ",
  description: "Browse the complete AERÉ premium sneaker collection.",
};

export default async function ProductsPage() {
  const products = await productService.getAll();

  return <ProductsPageClient initialProducts={products} />;
}
