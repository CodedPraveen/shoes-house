import Link from "next/link";
import ProductCard from "@/components/product-card";
import SectionReveal from "@/components/section-reveal";
import { productService } from "@/services/product-service";

export default async function TrendingGrid() {
  const trendingShoes = (await productService.getTrending()).slice(0, 6);

  return (
    <SectionReveal id="trending" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">
              Trending Shoes
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Most wanted right now.
            </h2>
          </div>
          <Link
            href="/trending"
            className="rounded-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trendingShoes.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}
