"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const SearchContext = createContext(null);

const defaultFilters = {
  query: "",
  priceRanges: [],
  sizes: [],
  colors: [],
};

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      filters,
      openSearch,
      closeSearch,
      updateFilters,
      resetFilters,
      toggleArrayFilter,
    }),
    [
      isOpen,
      filters,
      openSearch,
      closeSearch,
      updateFilters,
      resetFilters,
      toggleArrayFilter,
    ],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return context;
}
