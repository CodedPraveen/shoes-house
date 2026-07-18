import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8">
      <div className="mb-10 h-10 w-48 animate-pulse no54123-xl bg-zinc-200/70" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
