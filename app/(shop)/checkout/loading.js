import { CartSkeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-2">
      <div className="space-y-4 rounded-3xl border border-black/10 bg-zinc-50 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200/70" />
        <CartSkeleton />
      </div>
      <div className="h-64 animate-pulse rounded-3xl border border-black/10 bg-zinc-100/80" />
    </div>
  );
}
