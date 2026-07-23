import { getCache, setCache, deleteCache, deletePattern } from "@/lib/redis/chache";
import { productService } from "@/services/product-service";

const TTL = 60 * 5;

async function remember(key, callback, ttl = TTL) {
  const cached = await getCache(key);

  if (cached) return cached;

  const data = await callback();

  await setCache(key, data, ttl);

  return data;
}

export function getCachedSearchCatalog() {
  return remember(
    "search-catalog",
    () => productService.getSearchCatalog(),
    300,
  );
}

export function getCachedProductBySlug(slug) {
  return remember(
    `product:slug:${slug}`,
    () => productService.getBySlug(slug),
    300,
  );
}

export function getCachedRelatedProducts(slug, limit = 4) {
  return remember(
    `related:${slug}:${limit}`,
    () => productService.getRelatedBySlug(slug, limit),
    300,
  );
}

export async function clearProductCache(slug) {
  await Promise.all([
    deleteCache("search-catalog"),
    deleteCache(`product:slug:${slug}`),
    deletePattern("products:*"),
    deletePattern("related:*"),
    deletePattern("categories:*"),
    deletePattern("subcategories:*"),
  ]);
}