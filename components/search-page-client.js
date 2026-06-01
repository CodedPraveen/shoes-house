"use client";

import { useMemo } from "react";
import PageHeader from "@/components/page-header";
import ProductGrid from "@/components/product-grid";
import SearchFilters from "@/components/search-filters";
import { useSearchContext } from "@/context/search-context";
import { filterProducts, sortProducts } from "@/lib/filter-products";

export default function SearchPageClient({ allProducts = [] }) {
  const { filters, updateFilters, toggleArrayFilter, resetFilters } =
    useSearchContext();

  const results = useMemo(() => {
    const filtered = filterProducts(allProducts, filters);
    return sortProducts(filtered, "latest");
  }, [allProducts, filters]);

  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Search"
        title="Find your pair"
        description="Live filtering with price, size, and color — no page reload."
      />

      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[280px_1fr]">
        <SearchFilters
          filters={filters}
          onQueryChange={(query) => updateFilters({ query })}
          onToggleFilter={toggleArrayFilter}
          onReset={resetFilters}
        />
        <div className="space-y-6">
          <p className="text-sm text-black/50">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <ProductGrid products={results} />
        </div>
      </div>
    </main>
  );
}
