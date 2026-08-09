import Link from "next/link";

function pageHref(basePath, params, page) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== "" && key !== "page") search.set(key, String(value));
  }
  search.set("page", String(page));
  return `${basePath}?${search.toString()}`;
}

export default function Pagination({ basePath, params, page, pageCount, total }) {
  if (pageCount <= 1) return <p className="text-sm text-slate-500">{total} result{total === 1 ? "" : "s"}</p>;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-slate-500">Page {page} of {pageCount} · {total} results</p>
      <div className="flex gap-2">
        <Link aria-disabled={page <= 1} href={pageHref(basePath, params, Math.max(1, page - 1))} className={`rounded-xl border px-4 py-2 ${page <= 1 ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50"}`}>Previous</Link>
        <Link aria-disabled={page >= pageCount} href={pageHref(basePath, params, Math.min(pageCount, page + 1))} className={`rounded-xl border px-4 py-2 ${page >= pageCount ? "pointer-events-none border-slate-100 text-slate-300" : "border-slate-200 bg-white hover:bg-slate-50"}`}>Next</Link>
      </div>
    </div>
  );
}
