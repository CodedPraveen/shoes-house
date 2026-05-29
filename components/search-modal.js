"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import SearchFilters from "@/components/search-filters";
import ProductGrid from "@/components/product-grid";
import { useSearchContext } from "@/context/search-context";
import { productService } from "@/services/product-service";

export default function SearchModal() {
  const {
    isOpen,
    closeSearch,
    filters,
    updateFilters,
    toggleArrayFilter,
    resetFilters,
  } = useSearchContext();

  const results = useMemo(
    () => productService.search(filters, "latest"),
    [filters],
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          onClick={closeSearch}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between border-b border-black/10 px-5 py-5 sm:px-8">
              <h2 className="text-lg font-medium tracking-tight">Search</h2>
              <div className="flex items-center gap-3">
                <Link
                  href="/search"
                  onClick={closeSearch}
                  className="text-sm text-black/60 transition hover:text-black"
                >
                  Full search page
                </Link>
                <button
                  onClick={closeSearch}
                  className="rounded-full p-2 transition hover:bg-black/5"
                  aria-label="Close search"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[280px_1fr]">
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
