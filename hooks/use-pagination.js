"use client";

import { useMemo, useState, useCallback } from "react";
import { paginate } from "@/utils/pagination";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export function usePagination(items, perPage = PRODUCTS_PER_PAGE) {
  const [page, setPage] = useState(1);

  const result = useMemo(
    () => paginate(items, { page, perPage }),
    [items, page, perPage],
  );

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToPage = useCallback(
    (next) => {
      setPage(Math.min(Math.max(1, next), Math.max(1, result.totalPages)));
    },
    [result.totalPages]
  );

  return { ...result, setPage: goToPage, resetPage };
}
