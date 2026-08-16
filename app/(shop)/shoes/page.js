import { Suspense } from "react";
import CategoriesSection from "@/sections/categories-section";
import FeaturedProducts from "@/sections/featured-products";
import HeroSection from "@/sections/hero-section";
import NewsletterSection from "@/sections/newsletter-section";
// import TrendingGrid from "@/sections/trending-grid";
import ProductGridSkeleton from "@/components/product-grid-skeleton";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import dynamic from "next/dynamic";
import { getConfiguredProducts, getHomepageProductSections, getStorefrontConfig } from "@/services/storefront-service";

const TrendingGrid = dynamic(
  () => import("@/sections/trending-grid")
);

export default async function ShoesPage() {
  const [featuredFallback, trendingFallback, shoeCategories, storefront] =
    await Promise.all([
      productService.getBestSellers(6, "SHOES"),

      productService.getTrending(8, "SHOES"),

      categoryService.getSubCategoriesBySlug("shoes"),
      getStorefrontConfig("SHOES"),
    ]);

  const sections = new Map(storefront.sections.map((section) => [section.key, section]));
  const heroSection = sections.get("HERO");
  const productSections = getHomepageProductSections(storefront.sections, "SHOES");
  const configuredSections = await Promise.all(productSections.map(async (section) => ({
    ...section,
    products: await getConfiguredProducts(
      section,
      section.key === "FEATURED" ? featuredFallback : section.key === "TRENDING" ? trendingFallback : [],
    ),
  })));

  return (
    <main>
      {heroSection?.enabled === false ? null : <HeroSection slides={storefront.slides} />}
      {configuredSections.filter((section) => section.enabled).map((section) => (
        <Suspense key={section.key} fallback={<ProductGridSkeleton count={6} />}>
          {section.key === "FEATURED"
            ? <FeaturedProducts products={section.products} title={section.title} subtitle={section.subtitle || "Featured Products"} />
            : <TrendingGrid products={section.products} title={section.title} subtitle={section.subtitle} />}
        </Suspense>
      ))}
      {/* Existing category content stays fixed and is not part of CMS ordering. */}
      <CategoriesSection categories={shoeCategories} />
      <NewsletterSection />
    </main>
  );
}
