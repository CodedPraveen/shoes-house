import ProductsPageClient from "@/components/products-page-client";
import { productService } from "@/services/product-service";

export const revalidate = 120;
export const metadata = { title: "All Jewellery | Post Mart", description: "Browse the complete Post Mart jewellery collection." };

export default async function JewelleryProductsPage() {
  const products = await productService.getProducts({ collection: "JEWELLERY" });
  return <ProductsPageClient initialProducts={products} collection="JEWELLERY" />;
}
