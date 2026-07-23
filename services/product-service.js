import { filterProducts, sortProducts } from "@/lib/filter-products";
import { mapProduct, mapProducts } from "@/lib/mappers/product-mapper";
import { productInclude } from "@/lib/product-include";
import { notDeleted } from "@/lib/prisma-helpers";
import { prisma } from "@/lib/db";
import { getCache, setCache } from "@/lib/redis/cache";

const productWhere = { ...notDeleted, category: { deletedAt: null } };

async function fetchAllRaw() {
  return prisma.product.findMany({
    where: productWhere,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

const PRODUCT_CACHE_TTL = 60 * 5;

async function remember(key, callback, ttl = PRODUCT_CACHE_TTL) {
  const cached = await getCache(key);

  if (cached) return cached;

  const data = await callback();

  await setCache(key, data, ttl);

  return data;
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
    return remember(`product:slug:${slug}`, async () => {
      const row = await prisma.product.findFirst({
        where: { slug, ...notDeleted },
        include: productInclude,
      });

      return row ? mapProduct(row) : null;
    });
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

  async getNewArrivals(limit = 8, collection) {
    return remember(
      `products:new:${collection ?? "all"}:${limit}`,
      async () => {
        const rows = await prisma.product.findMany({
          where: {
            ...notDeleted,
            isNew: true,
            ...(collection && { collection }),
            category: {
              deletedAt: null,
            },
          },
          include: productInclude,
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
        });

        return mapProducts(rows);
      },
    );
  },

  async getTrending(limit = 8, collection) {
    return remember(
      `products:trending:${collection ?? "all"}:${limit}`,
      async () => {
        const rows = await prisma.product.findMany({
          where: {
            ...notDeleted,
            isTrending: true,
            ...(collection && { collection }),
            category: {
              deletedAt: null,
            },
          },
          include: productInclude,
          orderBy: {
            purchaseCount: "desc",
          },
          take: limit,
        });

        return mapProducts(rows);
      },
    );
  },

  async getBestSellers(limit = 8, collection) {
    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        ...(collection && { collection }),
        category: {
          deletedAt: null,
        },
      },
      include: productInclude,
      orderBy: {
        purchaseCount: "desc",
      },
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

  /** Lightweight catalog for search modal (no variants/colors join) */
  async getSearchCatalog() {
    const rows = await prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        discount: true,
        isNew: true,
        isTrending: true,
        purchaseCount: true,
        tags: true,
        brand: true,
        category: { select: { slug: true, name: true } },
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          take: 2,
          select: { url: true, isHover: true },
        },
        sizes: { select: { size: true } },
        colors: { select: { colorKey: true, label: true, hex: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((p) => {
      const primary = p.images.find((i) => !i.isHover) ?? p.images[0];
      const hover = p.images.find((i) => i.isHover) ?? p.images[1] ?? primary;
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? undefined,
        discount: p.discount ?? undefined,
        isNew: p.isNew,
        isTrending: p.isTrending,
        purchaseCount: p.purchaseCount,
        tags: p.tags,
        category: p.category.slug,
        categoryLabel: p.category.name,
        image: primary?.url ?? "",
        hoverImage: hover?.url ?? primary?.url ?? "",
        images: p.images.map((i) => i.url),
        sizes: p.sizes.map((s) => s.size).sort((a, b) => a - b),
        colors: p.colors.map((c) => ({
          id: c.colorKey,
          label: c.label,
          hex: c.hex,
        })),
      };
    });
  },

  async getSimilarBySlug(slug, limit = 4) {
    const product = await this.getBySlug(slug);
    if (!product) return [];

    const min = Math.floor(product.price * 0.8);
    const max = Math.ceil(product.price * 1.2);

    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        id: { not: product.id },
        category: { slug: product.category, deletedAt: null },
        price: { gte: min, lte: max },
      },
      include: productInclude,
      take: limit,
      orderBy: { purchaseCount: "desc" },
    });
    return mapProducts(rows);
  },

  async getByBrand(brand, excludeId, limit = 4) {
    const rows = await prisma.product.findMany({
      where: {
        ...notDeleted,
        brand,
        id: { not: excludeId },
        category: { deletedAt: null },
      },
      include: productInclude,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return mapProducts(rows);
  },

  async getByIds(ids, limit = 4) {
    const unique = [...new Set(ids)].filter(Boolean).slice(0, limit);
    if (!unique.length) return [];

    const rows = await prisma.product.findMany({
      where: { id: { in: unique }, ...notDeleted },
      include: productInclude,
    });
    const order = new Map(unique.map((id, i) => [id, i]));
    return mapProducts(rows).sort(
      (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99),
    );
  },
  
  async getProducts({ collection, category }) {
    return remember(
      `products:list:${collection ?? "all"}:${category ?? "all"}`,
      async () => {
        const where = {
          ...notDeleted,
        };

        if (collection) {
          where.collection = collection;
        }

        if (category) {
          where.category = {
            slug: category,
            deletedAt: null,
            ...(collection && { collection }),
          };
        } else {
          where.category = {
            deletedAt: null,
            ...(collection && { collection }),
          };
        }

        const rows = await prisma.product.findMany({
          where,
          include: productInclude,
          orderBy: {
            createdAt: "desc",
          },
        });

        return mapProducts(rows);
      },
    );
  },

  // async getSubCategories(collection) {
  //   return prisma.category.findMany({
  //     where: {
  //       collection,
  //       parentId: {
  //         not: null,
  //       },
  //       deletedAt: null,
  //     },
  //     orderBy: {
  //       sortOrder: "asc",
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       slug: true,
  //     },
  //   });
  // },
  // async getParentCategories(collection) {
  //   return prisma.category.findMany({
  //     where: {
  //       collection,
  //       parentId: null,
  //       deletedAt: null,
  //     },
  //     orderBy: {
  //       sortOrder: "asc",
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       slug: true,
  //     },
  //   });
  // },
};

