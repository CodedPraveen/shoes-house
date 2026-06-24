export default function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden no54123-2xl bg-white"
        >
          {/* Image skeleton */}
          <div className="aspect-[3/4] w-full bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />

          {/* Info skeleton */}
          <div className="p-4 space-y-3">
            {/* Brand line */}
            <div className="h-3 w-20 bg-gray-200 no54123 animate-pulse" />

            {/* Product name */}
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 no54123 animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 no54123 animate-pulse" />
            </div>

            {/* Price */}
            <div className="h-4 w-24 bg-gray-200 no54123 animate-pulse" />

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <div className="h-8 flex-1 bg-gray-200 no54123-full animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 no54123-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
