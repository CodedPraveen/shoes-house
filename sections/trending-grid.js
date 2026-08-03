import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import { productService } from "@/services/product-service";
import TrendingTabs from "@/components/trending-tabs";

export default function TrendingGrid({ products }) {

  return (
    <SectionReveal id="trending" className="sm:px-8 lg:pb-10" loading="lazy">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4 px-5 pb-8 mb-0">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Most wanted right now.
            </h2>
          </div>
          <Link
            href="/trending"
            className="no54123-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>
        <div className="bg-red-">
          <TrendingTabs initialProducts={products} />
        </div>
      </div>
    </SectionReveal>
  );
}