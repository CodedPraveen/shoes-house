import { Suspense } from "react";
import CategoriesSection from "@/sections/categories-section";
import FeaturedProducts from "@/sections/featured-products";
import HeroSection from "@/sections/hero-section";
import NewsletterSection from "@/sections/newsletter-section";
import DeferredTrendingSection from "@/components/deferred-trending-section";
import HeroSectionSkeleton from "@/components/hero-section-skeleton";
import ProductCarouselSkeleton from "@/components/product-carousel-skeleton";
import { productService } from "@/services/product-service";
import { categoryService } from "@/services/category-service";
import { getConfiguredProducts, getHomepageHeroConfig, getHomepageProductSection } from "@/services/storefront-service";

async function ShoesHero() {
  const hero = await getHomepageHeroConfig("SHOES");
  return hero.enabled ? <HeroSection slides={hero.slides} /> : null;
}

async function FeaturedProductCarousel() {
  const [section, fallback] = await Promise.all([
    getHomepageProductSection("SHOES", "FEATURED"),
    productService.getBestSellers(6, "SHOES"),
  ]);
  const products = await getConfiguredProducts(section, fallback);
  return section.enabled ? <FeaturedProducts products={products} title={section.title} subtitle={section.subtitle || "Featured Products"} /> : null;
}

async function ShoesCategories() {
  const categories = await categoryService.getSubCategoriesBySlug("shoes");
  return <CategoriesSection categories={categories} />;
}

export default function ShoesPage() {
  return (
    <main>
      <Suspense fallback={<HeroSectionSkeleton />}><ShoesHero /></Suspense>
      <Suspense fallback={<FeaturedProducts><ProductCarouselSkeleton /></FeaturedProducts>}>
        <FeaturedProductCarousel />
      </Suspense>
      <DeferredTrendingSection />
      <Suspense fallback={null}><ShoesCategories /></Suspense>
      <NewsletterSection />
    </main>
  );
}
