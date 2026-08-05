import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const revalidate = 120;

export const metadata = {
  title: "All Shoes | Post Mart",
  description: "Browse the complete Post Mart premium sneaker collection.",
};

export default async function ProductsPage() {
 const products = await productService.getProducts({
    collection: "SHOES",
    // category,
});

  return <ProductsPageClient initialProducts={products} />;
}
