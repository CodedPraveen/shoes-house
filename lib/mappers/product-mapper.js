import { validateProductImages } from "@/lib/product-image";
import { publicImageUrl } from "@/lib/image-storage";

export function productImageSource(image) {
  return publicImageUrl(image?.storagePath) || image?.url || "";
}

/**
 * Maps Prisma product (with relations) to the UI shape used across components.
 */
export function mapProduct(product) {
  const sortedImages = [...(product.images || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const imageSources = sortedImages.map(productImageSource);
  const primary = sortedImages.find((img) => !img.isHover) ?? sortedImages[0];
  const hover =
    sortedImages.find((img) => img.isHover) ??
    sortedImages[1] ??
    primary;
  const imageValidation = validateProductImages(imageSources);

  const variants = (product.variants || []).map((v) => ({
    id: v.id,
    sku: v.sku,
    colorKey: v.colorKey,
    size: v.size,
    stock: v.stock,
    price: v.price ?? product.price,
  }));

  return {
    id: product.id,
    collection: product.collection,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? undefined,
    discount: product.discount ?? undefined,
    stock: product.stock,
    processingStatus: product.processingStatus ?? "READY",
    processingError: product.processingError ?? null,
    processingJobId: product.processingJobId ?? null,
    variants,
    image: productImageSource(primary),
    hoverImage: productImageSource(hover) || productImageSource(primary),
    images: imageSources,
    imageValidation,
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

export function mapProducts(products, { includeInvalid = true } = {}) {
  const mapped = products.map(mapProduct);

  if (includeInvalid) {
    return mapped;
  }

  return mapped.filter((product) => product.imageValidation.isValid);
}
