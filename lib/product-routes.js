export function getCollectionSegment(collection) {
  if (!collection) throw new Error("A product collection is required");
  return String(collection).toLowerCase().replaceAll("_", "-");
}

export function getProductsPath(collection) {
  return `/${getCollectionSegment(collection)}/products`;
}

export function getProductPath(product) {
  return `/${getCollectionSegment(product.collection)}/product/${product.slug}`;
}
