"use client";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="rounded-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
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
        className="rounded-full border border-black/15 px-4 py-2 text-sm transition enabled:hover:bg-black enabled:hover:text-white disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
