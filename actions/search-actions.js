"use server";

import { assertRateLimit } from "@/lib/rate-limit";
import { getCachedSearchCatalog } from "@/lib/product-cache";
import { withPerf } from "@/lib/perf";

export async function getSearchCatalogAction() {
  await assertRateLimit({ prefix: "search-catalog", limit: 30, windowMs: 60_000 });
  return withPerf("search.catalog", () => getCachedSearchCatalog());
}
