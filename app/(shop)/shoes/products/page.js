import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const revalidate = 120;

export const metadata = {
  title: "All Shoes | Post Mart",
  description: "Browse the complete Post Mart premium sneaker collection.",
};

export default async function ShoesProductsPage() {
  const products = await productService.getProducts({ collection: "SHOES" });

  return (
    <ProductsPageClient
      initialProducts={products}
      collection="SHOES"
    />
  );
}