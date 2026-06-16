import { Suspense } from "react";
import BrandStory from "@/sections/brand-story";
import CategoriesSection from "@/sections/categories-section";
import FeaturedCollection from "@/sections/featured-collection";
import FeaturedProducts from "@/sections/featured-products";
import HeroSection from "@/sections/hero-section";
import NewsletterSection from "@/sections/newsletter-section";
import TrendingGrid from "@/sections/trending-grid";
import ProductGridSkeleton from "@/components/product-grid-skeleton";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <FeaturedProducts />
      </Suspense>
      <FeaturedCollection />
      <Suspense fallback={<ProductGridSkeleton count={6} />}>
        <TrendingGrid />
      </Suspense>
      <BrandStory />
      <CategoriesSection />
      <NewsletterSection />
    </main>
  );
}
