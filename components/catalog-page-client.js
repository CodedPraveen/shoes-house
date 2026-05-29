"use client";

import PageHeader from "@/components/page-header";
import ProductGrid from "@/components/product-grid";
import SearchFilters from "@/components/search-filters";
import SortSelect from "@/components/sort-select";
import { useProductFilters } from "@/hooks/use-product-filters";

export default function CatalogPageClient({
  eyebrow,
  title,
  description,
  initialProducts = null,
  category = null,
  showNewBadge = false,
  showRank = false,
  showFilters = true,
}) {
  const {
    products,
    sortBy,
    setSortBy,
    filters,
    toggleArrayFilter,
    resetFilters,
    setFilters,
  } = useProductFilters({ initialProducts, category });

  return (
    <main className="pt-20">
      <PageHeader eyebrow={eyebrow} title={title} description={description}>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </PageHeader>

      <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[260px_1fr]">
        {showFilters && (
          <aside className="hidden lg:block">
            <SearchFilters
              filters={filters}
              onQueryChange={(query) => setFilters((prev) => ({ ...prev, query }))}
              onToggleFilter={toggleArrayFilter}
              onReset={resetFilters}
              compact
            />
          </aside>
        )}
        <div className={showFilters ? "" : "lg:col-span-2"}>
          <ProductGrid
            products={products}
            showNewBadge={showNewBadge}
            showRank={showRank}
          />
        </div>
      </div>
    </main>
  );
}
