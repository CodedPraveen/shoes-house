import Link from "next/link";
import ProductCarousel from "@/components/product-carousel";
import SectionReveal from "@/components/section-reveal";

export default function FeaturedProducts({
  products,
  title = "Curated for quiet luxury.",
  subtitle = "Featured Products",
}) {
  return (
    <SectionReveal className="px-0 py-12 sm:px-8 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1400px] space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 sm:px-0">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-black/45">
              {subtitle}
            </p>

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h2>
          </div>

          <Link
            href="/shoes/products"
            className="inline-flex min-h-11 items-center rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            View All Shoes
          </Link>
        </div>

        <ProductCarousel products={products} />
      </div>
    </SectionReveal>
  );
}
