import { unstable_cache } from "next/cache";
import { productService } from "@/services/product-service";

export const getCachedSearchCatalog = unstable_cache(
  async () => productService.getSearchCatalog(),
  ["search-catalog"],
  { revalidate: 300, tags: ["products", "search-catalog"] },
);

export function getCachedProductBySlug(slug) {
  return unstable_cache(
    async () => productService.getBySlug(slug),
    ["product-by-slug", slug],
    { revalidate: 120, tags: ["products"] },
  )();
}

export function getCachedRelatedProducts(slug, limit = 4) {
  return unstable_cache(
    async () => productService.getRelatedBySlug(slug, limit),
    ["product-related", slug, String(limit)],
    { revalidate: 300, tags: ["products"] },
  )();
}
