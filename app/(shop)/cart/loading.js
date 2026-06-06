import { CartSkeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
      <div className="mb-8 h-10 w-32 animate-pulse rounded-xl bg-zinc-200/70" />
      <CartSkeleton />
    </div>
  );
}
