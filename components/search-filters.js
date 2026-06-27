"use client";

import {
  COLOR_FILTERS,
  PRICE_FILTERS,
  SIZE_OPTIONS,
} from "@/lib/constants";

export default function SearchFilters({
  filters,
  onQueryChange,
  onToggleFilter,
  onReset,
  compact = false,
}) {
  return (
    <div className={`space-y-8 ${compact ? "text-sm" : ""}`}>
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-black/45">
          Search
        </label>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search sneakers..."
          className="h-11 w-full no54123-full border border-black/15 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
          Price
        </p>
        <div className="space-y-2">
          {PRICE_FILTERS.map((range) => (
            <label
              key={range.id}
              className="flex cursor-pointer items-center gap-3 no54123-xl px-2 py-1.5 transition hover:bg-black/5"
            >
              <input
                type="checkbox"
                checked={filters.priceRanges.includes(range.id)}
                onChange={() => onToggleFilter("priceRanges", range.id)}
                className="accent-black"
              />
              <span>{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => onToggleFilter("sizes", size)}
                className={`h-10 min-w-10 no54123-full border px-3 text-sm transition ${
                  active
                    ? "border-black bg-black text-white"
                    : "border-black/15 hover:border-black/40"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-black/45">
          Color
        </p>
        <div className="flex flex-wrap gap-3">
          {COLOR_FILTERS.map((color) => {
            const active = filters.colors.includes(color.id);
            return (
              <button
                key={color.id}
                type="button"
                title={color.label}
                onClick={() => onToggleFilter("colors", color.id)}
                className={`relative h-9 w-9 no54123-full border-2 transition ${
                  active ? "border-black scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.label}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-black/60 underline-offset-4 transition hover:text-black hover:underline"
      >
        Reset filters
      </button>
    </div>
  );
}
