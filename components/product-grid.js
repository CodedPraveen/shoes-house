import ProductCard from "@/components/product-card";

export default function ProductGrid({ products, showRank = false, showNewBadge = false }) {
  if (!products?.length) {
    return (
      <p className="col-span-full py-20 text-center text-sm text-black/50">
        No products match your filters.
      </p>
    );
  }

  return (
    // <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3  bg-green">
    <div className="grid grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showRank={showRank}
          showNewBadge={showNewBadge}
        />
      ))}
    </div>
  );
}
