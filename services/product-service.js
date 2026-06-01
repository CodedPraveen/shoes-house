import { filterProducts, sortProducts } from "@/lib/filter-products";
import { mapProduct, mapProducts } from "@/lib/mappers/product-mapper";
import { productInclude } from "@/lib/product-include";
import { notDeleted } from "@/lib/prisma-helpers";
import { prisma } from "@/lib/db";

const productWhere = { ...notDeleted, category: { deletedAt: null } };

async function fetchAllRaw() {
  return prisma.product.findMany({
    where: productWhere,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

export const productService = {
  async getAll() {
    const rows = await fetchAllRaw();
    return mapProducts(rows);
  },

  async getById(id) {
    const row = await prisma.product.findFirst({
      where: { id, ...notDeleted },
      include: productInclude,
    });
    return row ? mapProduct(row) : null;
  },

  async getBySlug(slug) {
    const row = await prisma.product.findFirst({
      where: { slug, ...notDeleted },
      include: productInclude,
    });
    return row ? mapProduct(row) : null;
  },

  async getByCategory(categorySlug) {
    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        category: { slug: categorySlug, deletedAt: null },
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
    return mapProducts(rows);
  },

  async getNewArrivals() {
    const rows = await prisma.product.findMany({
      where: { ...notDeleted, isNew: true, category: { deletedAt: null } },
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
    return mapProducts(rows);
  },

  async getTrending() {
    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        isTrending: true,
        category: { deletedAt: null },
      },
      include: productInclude,
      orderBy: { purchaseCount: "desc" },
    });
    return mapProducts(rows);
  },

  async getBestSellers(limit = 6) {
    const rows = await prisma.product.findMany({
      where: productWhere,
      include: productInclude,
      orderBy: { purchaseCount: "desc" },
      take: limit,
    });
    return mapProducts(rows);
  },

  async getRelated(productId, limit = 4) {
    const current = await prisma.product.findFirst({
      where: { id: productId, ...notDeleted },
      include: { category: true },
    });
    if (!current) return [];

    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        id: { not: productId },
        category: { deletedAt: null },
        OR: [
          { categoryId: current.categoryId },
          { tags: { hasSome: current.tags } },
        ],
      },
      include: productInclude,
      take: limit,
    });
    return mapProducts(rows);
  },

  async getRelatedBySlug(slug, limit = 4) {
    const product = await this.getBySlug(slug);
    if (!product) return [];
    return this.getRelated(product.id, limit);
  },

  async search(filters = {}, sortBy = "latest") {
    const all = await this.getAll();
    const filtered = filterProducts(all, filters);
    return sortProducts(filtered, sortBy);
  },

  async getCustomerFavorites(limit = 6) {
    return this.getBestSellers(limit);
  },

  async getTrendingThisWeek(limit = 6) {
    return this.getTrending().then((items) => items.slice(0, limit));
  },

  async getAllSlugs() {
    return prisma.product.findMany({
      where: notDeleted,
      select: { slug: true },
    });
  },
};
