import { CartSkeleton } from "@/components/ui/skeleton";

export default function BuyNowCheckoutLoading() {
  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-24 sm:px-8 lg:grid-cols-2">
      <CartSkeleton />
    </div>
  );
}
