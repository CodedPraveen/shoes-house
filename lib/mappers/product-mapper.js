/**
 * Maps Prisma product (with relations) to the UI shape used across components.
 */
export function mapProduct(product) {
  const sortedImages = [...(product.images || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const primary = sortedImages.find((img) => !img.isHover) ?? sortedImages[0];
  const hover =
    sortedImages.find((img) => img.isHover) ??
    sortedImages[1] ??
    primary;

  const variants = (product.variants || []).map((v) => ({
    id: v.id,
    sku: v.sku,
    colorKey: v.colorKey,
    size: v.size,
    stock: v.stock,
    price: v.price ?? product.price,
  }));

  const totalVariantStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const stock = variants.length > 0 ? totalVariantStock : product.stock;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    discount: product.discount ?? undefined,
    stock,
    variants,
    image: primary?.url ?? "",
    hoverImage: hover?.url ?? primary?.url ?? "",
    images: sortedImages.map((img) => img.url),
    colors: (product.colors || []).map((c) => ({
      id: c.colorKey,
      label: c.label,
      hex: c.hex,
    })),
    sizes: (product.sizes || []).map((s) => s.size).sort((a, b) => a - b),
    category: product.category?.slug ?? "",
    categoryLabel: product.category?.name ?? "",
    tags: product.tags ?? [],
    isNew: product.isNew,
    isTrending: product.isTrending,
    purchaseCount: product.purchaseCount,
    rank: product.rank ?? undefined,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    materials: product.materials ?? "",
    shipping: product.shippingInfo ?? "",
    returnPolicy: product.returnPolicy ?? "",
  };
}

export function mapProducts(products) {
  return products.map(mapProduct);
}

/** Resolve variant for cart/checkout */
export function findVariant(product, color, size) {
  return product.variants?.find(
    (v) => v.colorKey === color && v.size === Number(size),
  );
}
