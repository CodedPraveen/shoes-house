import { NextResponse } from "next/server";
import { productService } from "@/services/product-service";
import { getConfiguredProducts, getHomepageProductSection } from "@/services/storefront-service";
import { isMobileHomepageRequest, withAbsoluteProductImages } from "@/lib/mobile-product-images";

const SECTION_LOADERS = {
  featured: { key: "FEATURED", load: () => productService.getBestSellers(6, "SHOES") },
  trending: { key: "TRENDING", load: () => productService.getTrending(16, "SHOES") },
};

export async function GET(request, { params }) {
  const { section: requestedSection } = await params;
  const definition = SECTION_LOADERS[requestedSection];

  if (!definition) {
    return NextResponse.json({ error: "Unknown homepage section" }, { status: 404 });
  }

  const [section, fallback] = await Promise.all([
    getHomepageProductSection("SHOES", definition.key),
    definition.load(),
  ]);
  const products = await getConfiguredProducts(section, fallback);

  return NextResponse.json(
    {
      section: { title: section.title, subtitle: section.subtitle, enabled: section.enabled },
      products: isMobileHomepageRequest(request)
        ? products.map((product) => withAbsoluteProductImages(product))
        : products,
    },
    { headers: { "Cache-Control": "private, max-age=60", Vary: "Accept" } },
  );
}
