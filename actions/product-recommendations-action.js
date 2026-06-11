"use server";

import { productService } from "@/services/product-service";
import { withPerf } from "@/lib/perf";

export async function getProductRecommendationsAction({
  slug,
  productId,
  brand,
  recentIds = [],
}) {
  return withPerf("recommendations", async () => {
    const [related, similar, alsoViewed, sameBrand] = await Promise.all([
      productService.getRelatedBySlug(slug, 4),
      productService.getSimilarBySlug(slug, 4),
      productService.getByIds(
        recentIds.filter((id) => id !== productId),
        4,
      ),
      productService.getByBrand(brand, productId, 4),
    ]);

    return { related, similar, alsoViewed, sameBrand };
  });
}
