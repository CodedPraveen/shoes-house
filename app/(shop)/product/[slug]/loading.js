import { ProductDetailSkeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
      <ProductDetailSkeleton />
    </div>
  );
}
