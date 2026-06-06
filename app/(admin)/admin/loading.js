import { AdminTableSkeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-56 animate-pulse rounded-xl bg-zinc-200/70" />
      <AdminTableSkeleton rows={8} />
    </div>
  );
}
