import {
  filterProducts,
  sortProducts,
} from "@/lib/filter-products";
import {
  getBestSellers,
  getNewArrivals,
  getProductById,
  getProductsByCategory,
  getRelatedProducts,
  getTrendingProducts,
  products,
} from "@/data/catalog";

/**
 * Product service — swap implementations when MongoDB/Prisma is added.
 */
export const productService = {
  getAll() {
    return products;
  },

  getById(id) {
    return getProductById(id);
  },

  getByCategory(category) {
    return getProductsByCategory(category);
  },

  getNewArrivals() {
    return getNewArrivals();
  },

  getTrending() {
    return getTrendingProducts();
  },

  getBestSellers(limit) {
    return getBestSellers(limit);
  },

  getRelated(productId, limit) {
    return getRelatedProducts(productId, limit);
  },

  search(filters = {}, sortBy = "latest") {
    const filtered = filterProducts(products, filters);
    return sortProducts(filtered, sortBy);
  },

  getCustomerFavorites(limit = 6) {
    return [...products]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  getTrendingThisWeek(limit = 6) {
    return getTrendingProducts().slice(0, limit);
  },
};
