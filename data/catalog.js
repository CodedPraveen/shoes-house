/**
 * SEED-ONLY — used by prisma/seed.js to populate Supabase.
 * Storefront reads products via productService → Prisma.
 */

const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const cloudinaryImages = [
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548727/WhatsApp_Image_2026-08-07_at_11.01.54_AM.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548890/WhatsApp_Image_2026-08-07_at_11.01.55_AM.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786549156/9b4f883c-b625-4369-889d-500e17a1b8fd.png",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550507/288e7ec9-070a-4bc9-b337-1b1789dc7c2b.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550529/8fc723d9-fbb1-4751-b82d-05dfbedddfb4.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550532/3ecff149-a5eb-4f8a-b6a3-05d92e300fb5.jpg",
];

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
