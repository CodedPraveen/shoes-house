import Link from "next/link";
import ProductCarousel from "@/components/product-carousel";
import SectionReveal from "@/components/section-reveal";

export default function FeaturedProducts({
  products,
  title = "Curated for quiet luxury.",
  subtitle = "Featured Products",
}) {
  return (
    <SectionReveal className="px-0 py-1 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-350 space-y-10">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-4 px-5 py-2 sm:mb-10">
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