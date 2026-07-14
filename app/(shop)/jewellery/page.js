import { Suspense } from "react";
import ProductGridSkeleton from "@/components/product-grid-skeleton";
import BestSellers from "@/components/jewellery/best-sellers";
import CategorySection from "@/components/jewellery/category-section";
import CollectionSection from "@/components/jewellery/collection-section";
import JewelleryHero from "@/components/jewellery/hero";
import InstagramFeed from "@/components/jewellery/instagram-feed";
import JewelleryNewsletter from "@/components/jewellery/newsletter-section";
import NewArrivals from "@/components/jewellery/new-arrivals";
import ReviewSection from "@/components/jewellery/review-section";
import ShopTheLook from "@/components/jewellery/shop-the-look";
import TrendingProducts from "@/components/jewellery/trending-products";
import TrustStrip from "@/components/jewellery/trust-strip";
import { JEWELLERY_COLLECTIONS } from "@/data/jewellery-content";

export default function JewelleryPage() {
  return (
    <main>
      <JewelleryHero />
      <TrustStrip />
      <CategorySection />

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16 " >
            <ProductGridSkeleton count={6} />
          </div>
        }
      >
        <TrendingProducts />
      </Suspense>

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
        <NewArrivals />
      </Suspense>

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
            <ProductGridSkeleton count={4} />
          </div>
        }
      >
        <BestSellers />
      </Suspense>

      {/* <InstagramFeed /> */}
      <ReviewSection />
      <JewelleryNewsletter />
    </main>
  );
}
