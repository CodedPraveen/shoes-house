/**
 * SEED-ONLY — used by prisma/seed.js to populate Supabase.
 * Storefront reads products via productService → Prisma.
 */

const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const products = [];

// export const products = []; // Empty array for SEED-ONLY usage

export function getProductById(id) {
  return products.find((p) => p.id === id) ?? null;
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category);
}

export function getNewArrivals() {
  return products
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getTrendingProducts() {
  return products
    .filter((p) => p.isTrending)
    .sort((a, b) => b.purchaseCount - a.purchaseCount);
}

export function getBestSellers(limit = 6) {
  return [...products]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, limit);
}

export function getRelatedProducts(productId, limit = 4) {
  const current = getProductById(productId);
  if (!current) return [];

  return products
    .filter(
      (p) =>
        p.id !== productId &&
        (p.category === current.category ||
          p.tags.some((t) => current.tags.includes(t))),
    )
    .slice(0, limit);
}
