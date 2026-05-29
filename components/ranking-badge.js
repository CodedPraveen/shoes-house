export default function RankingBadge({ rank }) {
  if (!rank || rank > 3) return null;

  return (
    <span className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white shadow-lg">
      #{rank}
    </span>
  );
}
