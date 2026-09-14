"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SectionReveal from "@/components/section-reveal";
import ProductCarouselSkeleton from "@/components/product-carousel-skeleton";

const TrendingTabs = dynamic(() => import("@/components/trending-tabs"), {
  loading: () => <ProductCarouselSkeleton count={4} />,
});

const DEFAULT_SECTION = {
  title: "Most wanted right now.",
  subtitle: null,
};

export default function DeferredTrendingSection() {
  const markerRef = useRef(null);
  const startedRef = useRef(false);
  const [section, setSection] = useState(DEFAULT_SECTION);
  const [products, setProducts] = useState(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return undefined;

    const load = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      fetch("/api/homepage/sections/trending", { credentials: "same-origin" })
        .then((response) => (response.ok ? response.json() : Promise.reject()))
        .then((payload) => {
          setSection({ ...DEFAULT_SECTION, ...payload.section });
          setProducts(payload.products ?? []);
        })
        .catch(() => setProducts([]));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          load();
          observer.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return (
    <SectionReveal id="trending" className="sm:px-8 lg:pb-10">
      <div ref={markerRef} className="mx-auto w-full max-w-350 space-y-10">
        <div className="mb-0 flex flex-wrap items-end justify-between gap-4 px-5 pb-8">
          <div className="space-y-3">
            {section.subtitle ? <p className="text-xs uppercase tracking-[0.25em] text-black/45">{section.subtitle}</p> : null}
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">{section.title}</h2>
          </div>
          <Link href="/trending" className="no54123-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black hover:text-white">View All</Link>
        </div>
        {products === null ? <ProductCarouselSkeleton count={4} /> : <TrendingTabs initialProducts={products.slice(0, 16)} />}
      </div>
    </SectionReveal>
  );
}
