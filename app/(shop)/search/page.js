import SearchPageClient from "@/components/search-page-client";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Search | Post Mart",
};

export default async function SearchPage() {
  const products = await productService.getAll();
  return <SearchPageClient allProducts={products} />;
}
