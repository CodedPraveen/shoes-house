"use client";

import { useMemo, useState } from "react";
import { filterProducts, sortProducts } from "@/lib/filter-products";

export function useProductFilters({ initialProducts = [], category = null } = {}) {
  const [sortBy, setSortBy] = useState("latest");
  const [filters, setFilters] = useState({
    query: "",
    priceRanges: [],
    sizes: [],
    colors: [],
    category,
  });

  const products = useMemo(() => {
    const filtered = filterProducts(initialProducts, {
      ...filters,
      category: category ?? filters.category,
    });
    return sortProducts(filtered, sortBy);
  }, [filters, sortBy, initialProducts, category]);

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const resetFilters = () =>
    setFilters({
      query: "",
      priceRanges: [],
      sizes: [],
      colors: [],
      category: category ?? null,
    });

  return {
    products,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    toggleArrayFilter,
    resetFilters,
  };
}
