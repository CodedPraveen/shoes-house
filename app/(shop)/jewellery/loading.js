import ProductGridSkeleton from "@/components/product-grid-skeleton";

export default function JewelleryLoading() {
  return (
    <main className="animate-pulse bg-[#fcf8f9]">
      <div className="min-h-[70vh] bg-[#f0edee] sm:min-h-[80vh]" />
      <div className="border-y border-[#c5c7c1]/30 bg-[#FDFCFB] py-12">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-4 md:grid-cols-4 md:px-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mx-auto h-8 w-24 rounded bg-[#eae7e8]" />
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-16">
        <ProductGridSkeleton count={4} />
      </div>
    </main>
  );
}
