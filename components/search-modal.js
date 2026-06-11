"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import SearchFilters from "@/components/search-filters";
import ProductGrid from "@/components/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useSearchContext } from "@/context/search-context";
import { filterProducts, sortProducts } from "@/lib/filter-products";
import { getSearchCatalogAction } from "@/actions/search-actions";

export default function SearchModal() {
  const {
    isOpen,
    closeSearch,
    filters,
    updateFilters,
    toggleArrayFilter,
    resetFilters,
  } = useSearchContext();

  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen || loaded) return;
    setLoading(true);
    getSearchCatalogAction()
      .then((items) => {
        setCatalog(items);
        setLoaded(true);
      })
      .finally(() => setLoading(false));
  }, [isOpen, loaded]);

  const results = useMemo(() => {
    const filtered = filterProducts(catalog, filters);
    return sortProducts(filtered, "latest");
  }, [catalog, filters]);

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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto mt-16 max-h-[85vh] w-full max-w-[1400px] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search</h2>
              <button type="button" onClick={closeSearch} aria-label="Close search">
                <X size={20} />
              </button>
            </div>
            <SearchFilters
              filters={filters}
              updateFilters={updateFilters}
              toggleArrayFilter={toggleArrayFilter}
              resetFilters={resetFilters}
            />
            <div className="mt-8">
              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : (
                <>
                  <ProductGrid products={results.slice(0, 12)} />
                  <Link
                    href="/search"
                    onClick={closeSearch}
                    className="mt-6 inline-block text-sm underline"
                  >
                    Full search page
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
