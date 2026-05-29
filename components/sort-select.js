"use client";

import { SORT_OPTIONS } from "@/lib/constants";

export default function SortSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-full border border-black/15 bg-white px-4 text-sm outline-none transition focus:ring-2 focus:ring-black/20"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
