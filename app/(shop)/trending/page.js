import PageHeader from "@/components/page-header";
import ProductGrid from "@/components/product-grid";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trending | Shoes House",
  description: "Best sellers and trending sneakers this week.",
};

export default async function TrendingPage() {
  const bestSellers = (await productService.getBestSellers(6)).map(
    (product, index) => ({
      ...product,
      rank: index < 3 ? index + 1 : product.rank,
    }),
  );
  const trendingWeek = await productService.getTrendingThisWeek(6);
  const favorites = await productService.getCustomerFavorites(6);

  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Trending"
        title="Most wanted right now"
        description="Most purchased products, weekly trends, and customer favorites."
      />

      <div className="mx-auto w-full max-w-[1400px] space-y-20 px-5 pb-20 sm:px-8">
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">Best Sellers</h2>
          <ProductGrid products={bestSellers} showRank />
        </section>
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Trending This Week
          </h2>
          <ProductGrid products={trendingWeek} />
        </section>
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Customer Favorites
          </h2>
          <ProductGrid products={favorites} />
        </section>
      </div>
    </main>
  );
}
