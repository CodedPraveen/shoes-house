import Link from "next/link";
import ProductCard from "@/components/product-card";
import ProductCarousel from "@/components/product-carousel";
import SectionReveal from "@/components/section-reveal";
import { productService } from "@/services/product-service";

// export default async function FeaturedProducts() {
//   const products = await productService.getBestSellers(6);
export default function FeaturedProducts({ products }) {

  return (
    <SectionReveal className="px-0 py-1 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-2">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">
              Featured Products
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Curated for quiet luxury.
            </h2>
          </div>
          <Link
            href="/products"
            className="no54123-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black hover:text-white"
          >
            View All Shoes
          </Link>
        </div>
        <ProductCarousel products={products} />
      </div>
    </SectionReveal>
  );
}
