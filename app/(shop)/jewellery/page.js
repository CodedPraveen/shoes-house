import { Suspense } from "react";
import ProductGridSkeleton from "@/components/product-grid-skeleton";
import BestSellers from "@/components/jewellery/best-sellers";
import CategorySection from "@/components/jewellery/category-section";
import CollectionSection from "@/components/jewellery/collection-section";
import JewelleryHero from "@/components/jewellery/hero";
import JewelleryNewsletter from "@/components/jewellery/newsletter-section";
import NewArrivals from "@/components/jewellery/new-arrivals";
import ReviewSection from "@/components/jewellery/review-section";
import ShopTheLook from "@/components/jewellery/shop-the-look";
import TrendingProducts from "@/components/jewellery/trending-products";
import TrustStrip from "@/components/jewellery/trust-strip";
import { JEWELLERY_COLLECTIONS } from "@/data/jewellery-content";
import { productService } from "@/services/product-service";
import ProductGrid from "@/components/product-grid";
import HeroSection from "@/sections/hero-section";
import { getConfiguredProducts, getHomepageProductSections, getStorefrontConfig } from "@/services/storefront-service";

export default async function JewelleryPage({
  searchParams,
}) {
  const params = await searchParams;

  const category = params.category;

  const [
    products,
    trendingProducts,
    newArrivals,
    bestSellers,
    storefront,
  ] = await Promise.all([
    productService.getProducts({
      collection: "JEWELLERY",
      category,
    }),
    productService.getTrending(8, "JEWELLERY"),

    productService.getNewArrivals(8, "JEWELLERY"),

    productService.getBestSellers(8, "JEWELLERY"),
    getStorefrontConfig("JEWELLERY"),
  ]);

  const sections = new Map(storefront.sections.map((section) => [section.key, section]));
  const heroSection = sections.get("HERO");
  const productSections = getHomepageProductSections(storefront.sections, "JEWELLERY");
  const configuredSections = await Promise.all(productSections.map(async (section) => ({
    ...section,
    products: await getConfiguredProducts(
      section,
      section.key === "TRENDING" ? trendingProducts : section.key === "NEW_ARRIVALS" ? newArrivals : [],
    ),
  })));

  return (
    <main>
      {heroSection?.enabled === false ? null : storefront.slides.length ? <HeroSection slides={storefront.slides} /> : <JewelleryHero />}
      <TrustStrip />
      <CategorySection />

      {category && (
        <ProductGrid products={products} />
      )}

      {configuredSections.filter((section) => section.enabled).map((section) => (
        <Suspense key={section.key} fallback={<div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16"><ProductGridSkeleton count={6} /></div>}>
          {section.key === "NEW_ARRIVALS"
            ? <NewArrivals products={section.products} title={section.title} subtitle={section.subtitle || "Fresh designs for the season"} />
            : <TrendingProducts products={section.products.slice(0, 8)} title={section.title} subtitle={section.subtitle || "Most loved this season"} />}
        </Suspense>
      ))}

      <CollectionSection {...JEWELLERY_COLLECTIONS.wedding} />
      <CollectionSection {...JEWELLERY_COLLECTIONS.office} reverse />
      <CollectionSection {...JEWELLERY_COLLECTIONS.gift} />

      <ShopTheLook />

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
            <ProductGridSkeleton count={4} />
          </div>
        }
      >
        <BestSellers products={bestSellers} />
      </Suspense>
      <ReviewSection />
      <JewelleryNewsletter />
    </main>
  );
}
