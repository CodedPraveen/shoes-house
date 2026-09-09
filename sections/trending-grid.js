import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import TrendingTabs from "@/components/trending-tabs";

export default function TrendingGrid({
  products,
  title = "Most wanted right now.",
  subtitle = null,
}) {
  return (
    <SectionReveal
      id="trending"
      className="border-t border-black/8 px-5 py-12 sm:px-8 sm:py-16 lg:py-24"
      loading="lazy"
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-8 sm:space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="space-y-3">
            {subtitle ? (
              <p className="text-xs uppercase tracking-[0.25em] text-black/45">
                {subtitle}
              </p>
            ) : null}

            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h2>
          </div>

          <Link
            href="/trending"
            className="inline-flex min-h-11 items-center rounded-full border border-black/15 px-5 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>

        <TrendingTabs initialProducts={products.slice(0, 6)} />
      </div>
    </SectionReveal>
  );
}
