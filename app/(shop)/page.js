import BrandStory from "@/sections/brand-story";
import CategoriesSection from "@/sections/categories-section";
import FeaturedCollection from "@/sections/featured-collection";
import HeroSection from "@/sections/hero-section";
import NewsletterSection from "@/sections/newsletter-section";
import TrendingGrid from "@/sections/trending-grid";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedCollection />
      <TrendingGrid />
      <BrandStory />
      <CategoriesSection />
      <NewsletterSection />
    </main>
  );
}
