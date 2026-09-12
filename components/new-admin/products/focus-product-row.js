"use client";

import { useEffect } from "react";

const focusClasses = [
  "bg-indigo-50",
  "ring-2",
  "ring-inset",
  "ring-indigo-500",
];

export default function FocusProductRow({ productId }) {
  useEffect(() => {
    if (typeof productId !== "string" || !productId) {
      return;
    }

    const row = document.getElementById(`product-${productId}`);

    if (row) {
      row.classList.add(...focusClasses);
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("focusProduct");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    const timeout = window.setTimeout(() => {
      row?.classList.remove(...focusClasses);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
      row?.classList.remove(...focusClasses);
    };
  }, [productId]);

  return null;
}
