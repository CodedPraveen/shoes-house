import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const revalidate = 120;

export const metadata = {
  title: "All Products | Post Mart",
  description: "Browse all available Post Mart products.",
};

export default async function AllProductsPage() {
  const products = await productService.getProducts({});

  return (
    <ProductsPageClient
      initialProducts={products}
      collection="ALL"
    />
  );
}
