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
  ] = await Promise.all([
    productService.getProducts({
      collection: "JEWELLERY",
      category,
    }),
    productService.getTrending(),
    productService.getNewArrivals(8),
    productService.getBestSellers(8),
  ]);
  console.log(products.length)

  return (
    <main>
      <JewelleryHero />
      <TrustStrip />
      <CategorySection />

      {category ? (
        <ProductGrid products={products} />
      ) : (
        <>
          <TrendingProducts products={trendingProducts.slice(0, 8)} />

          <CollectionSection {...JEWELLERY_COLLECTIONS.wedding} />
          <CollectionSection {...JEWELLERY_COLLECTIONS.office} reverse />
          <CollectionSection {...JEWELLERY_COLLECTIONS.gift} />

          <ShopTheLook />

          <NewArrivals products={newArrivals} />

          <BestSellers products={bestSellers} />
        </>
      )}
      {/* 
      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16 " >
            <ProductGridSkeleton count={6} />
          </div>
        }
      >
       
        <TrendingProducts products={trendingProducts.slice(0, 8)} />
      </Suspense>


      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
            <ProductGridSkeleton count={4} />
          </div>
        }
      >

        <NewArrivals products={newArrivals} />

      </Suspense>

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
            <ProductGridSkeleton count={4} />
          </div>
        }
      >
        <BestSellers products={bestSellers} />
     
      </Suspense> */}

      {/* <InstagramFeed /> */}
      <ReviewSection />
      <JewelleryNewsletter />
    </main>
  );
}
