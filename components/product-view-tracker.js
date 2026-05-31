"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export default function ProductViewTracker({ productId }) {
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    if (productId) trackView(productId);
  }, [productId, trackView]);

  return null;
}
