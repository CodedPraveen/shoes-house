import { Suspense } from "react";
import CategoriesSection from "@/sections/categories-section";
import FeaturedProducts from "@/sections/featured-products";
import HeroSection from "@/sections/hero-section";
import NewsletterSection from "@/sections/newsletter-section";
import TrendingGrid from "@/sections/trending-grid";
import ProductGridSkeleton from "@/components/product-grid-skeleton";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import dynamic from "next/dynamic";

const TrendingGrid = dynamic(
  () => import("@/sections/trending-grid")
);

export default async function ShoesPage({ searchParams, }) {
  const params = await searchParams;

  const category = params.category;

  const [products, featuredProducts, trendingProducts, shoeCategories,] =
    await Promise.all([
      productService.getProducts({
        collection: "SHOES",
        category,
      }),

      productService.getBestSellers(6, "SHOES"),

      productService.getTrending(8, "SHOES"),

      categoryService.getSubCategoriesBySlug("shoes"),
    ]);

  return (
    <main>
      <HeroSection />
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        {/* <FeaturedProducts products={products}/> */}
        <FeaturedProducts products={featuredProducts} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={6} />}>

        <TrendingGrid products={trendingProducts} />

        {/* <TrendingGrid /> */}
      </Suspense>
      <CategoriesSection categories={shoeCategories} />
      <NewsletterSection />
    </main>
  );
}
