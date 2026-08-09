import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, detail, tone = "default", href }) {
  const tones = {
    default: "border-slate-200 bg-white",
    dark: "border-slate-950 bg-slate-950 text-white",
    amber: "border-amber-200 bg-amber-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };
  const content = (
    <div className={`relative rounded-2xl border p-4 shadow-sm ${tones[tone] ?? tones.default}`}>
      <p className={`text-xs font-medium uppercase tracking-[0.12em] ${tone === "dark" ? "text-white/55" : "text-slate-500"}`}>{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {detail ? <p className={`mt-1 text-xs ${tone === "dark" ? "text-white/55" : "text-slate-500"}`}>{detail}</p> : null}
      {href ? <ArrowUpRight className="absolute right-4 top-4 size-4 opacity-40" aria-hidden="true" /> : null}
    </div>
  );
  return href ? <Link href={href} className="block rounded-2xl outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-500">{content}</Link> : content;
}

export function StatusBadge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    indigo: "bg-indigo-100 text-indigo-800",
    emerald: "bg-emerald-100 text-emerald-800",
    rose: "bg-rose-100 text-rose-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide ${tones[tone] ?? tones.slate}`}>{children}</span>;
}

export function EmptyState({ title = "Nothing here yet", description }) {
  return (
    <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <div>
        <Inbox className="mx-auto size-8 text-slate-300" aria-hidden="true" />
        <p className="mt-3 font-medium text-slate-900">{title}</p>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
    </div>
  );
}

export const inputClass = "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
export const buttonClass = "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";
