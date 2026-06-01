"use client";

import { useEffect } from "react";
import PageHeader from "@/components/page-header";
import Pagination from "@/components/pagination";
import ProductGrid from "@/components/product-grid";
import SearchFilters from "@/components/search-filters";
import SortSelect from "@/components/sort-select";
import { usePagination } from "@/hooks/use-pagination";
import { useProductFilters } from "@/hooks/use-product-filters";

export default function ProductsPageClient({ initialProducts = [] }) {
  const {
    products: filtered,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    toggleArrayFilter,
    resetFilters,
  } = useProductFilters({ initialProducts });

  const { data, page, totalPages, setPage, resetPage, total } = usePagination(
    filtered,
  );

  useEffect(() => {
    resetPage();
  }, [filters, sortBy, resetPage]);

  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Shop"
        title="All Shoes"
        description={`Browse the full AERÉ collection — ${total} pairs available.`}
      >
        <SortSelect value={sortBy} onChange={setSortBy} />
      </PageHeader>

      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-8 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <SearchFilters
            filters={filters}
            onQueryChange={(query) => setFilters((prev) => ({ ...prev, query }))}
            onToggleFilter={toggleArrayFilter}
            onReset={resetFilters}
            compact
          />
        </aside>
        <div className="space-y-8">
          <ProductGrid products={data} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </main>
  );
}
