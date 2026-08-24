"use client";

import { useEffect, useState } from "react";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}) {
  const [showMobilePagination, setShowMobilePagination] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowMobilePagination(window.scrollY > 120);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (totalPages <= 1) return null;

  return (
    <>
      {/* Desktop */}
      <nav
        className={`hidden items-center justify-center gap-2 sm:flex ${className}`}
        aria-label="Pagination"
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="no54123-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-3 text-sm text-black/60">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="no54123-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
        >
          Next
        </button>
      </nav>

      {/* Mobile */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-2 border-t border-black/10 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur transition-transform duration-300 sm:hidden ${showMobilePagination
            ? "translate-y-0"
            : "translate-y-full"
          }`}
        aria-label="Pagination"
      >
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="no54123-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-3 text-sm text-black/60">
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="no54123-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </>
  );
}