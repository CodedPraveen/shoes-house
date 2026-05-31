export default function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-black/45">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-sm text-black/50">{hint}</p>}
    </div>
  );
}
