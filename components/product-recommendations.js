"use client";

import { useEffect, useRef, useState } from "react";
import ProductGrid from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { getProductRecommendationsAction } from "@/actions/product-recommendations-action";

function RecommendationBlock({ title, products }) {
  if (!products?.length) return null;
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      <ProductGrid products={products} />
    </section>
  );
}

export default function ProductRecommendations({
  slug,
  productId,
  brand,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const { productIds: recentIds } = useRecentlyViewed();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || data) return;

    getProductRecommendationsAction({
      slug,
      productId,
      brand,
      recentIds,
    }).then(setData);
  }, [visible, data, slug, productId, brand, recentIds]);

  return (
    <div ref={ref} className="space-y-16 border-t border-black/10 pt-12">
      {!data ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <>
          <RecommendationBlock title="Related Products" products={data.related} />
          <RecommendationBlock title="Similar Products" products={data.similar} />
          <RecommendationBlock
            title="Customers Also Viewed"
            products={data.alsoViewed}
          />
          <RecommendationBlock
            title={`More From ${brand}`}
            products={data.sameBrand}
          />
        </>
      )}
    </div>
  );
}
