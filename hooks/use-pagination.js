"use client";

import { useMemo, useState } from "react";
import { paginate } from "@/utils/pagination";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";

export function usePagination(items, perPage = PRODUCTS_PER_PAGE) {
  const [page, setPage] = useState(1);

  const result = useMemo(
    () => paginate(items, { page, perPage }),
    [items, page, perPage],
  );

  const goToPage = (next) => {
    setPage(Math.min(Math.max(1, next), result.totalPages));
  };

  const resetPage = () => setPage(1);

  return { ...result, setPage: goToPage, resetPage };
}
