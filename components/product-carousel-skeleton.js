export default function ProductCarouselSkeleton({ count = 4 }) {
  return (
    <div className="flex overflow-hidden px-1" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-[46%] shrink-0 px-1.5 sm:w-[42%] sm:px-2 md:w-1/3 lg:w-1/4 xl:w-[23%]"
        >
          <div className="space-y-3" aria-hidden>
            <div className="aspect-[2/3] animate-pulse bg-zinc-200/70" />
            <div className="h-3 w-2/3 animate-pulse bg-zinc-200/70" />
            <div className="h-3 w-1/3 animate-pulse bg-zinc-200/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
