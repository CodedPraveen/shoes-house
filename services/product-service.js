import { filterProducts, sortProducts } from "@/lib/filter-products";
import { mapProduct, mapProducts } from "@/lib/mappers/product-mapper";
import { productInclude } from "@/lib/product-include";
import { notDeleted } from "@/lib/prisma-helpers";
import { prisma } from "@/lib/db";
import { getCache, setCache } from "@/lib/redis/cache";
import { validateProductImages } from "@/lib/product-image";

import { activeProductWhere } from "@/lib/product-where";

const productWhere = activeProductWhere;
// const productWhere = { ...notDeleted, category: { deletedAt: null } };

async function fetchAllRaw() {
  return prisma.product.findMany({
    where: productWhere,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

const PRODUCT_CACHE_TTL = 60 * 5;
const PRODUCT_CACHE_VERSION = "product-images-v2";

function mapCustomerProduct(row) {
  return mapProduct(row);
}

async function remember(key, callback, ttl = PRODUCT_CACHE_TTL) {
  const cacheKey = `${PRODUCT_CACHE_VERSION}:${key}`;
  const cached = await getCache(cacheKey);

  if (cached) return cached;

  const data = await callback();

  setCache(cacheKey, data, ttl).catch(() => { });
  return data;
}

export const productService = {
  async getAll({ includeInvalid = false } = {}) {
    const rows = await fetchAllRaw();

    return mapProducts(rows, { includeInvalid });
  },

  async getById(id) {
    const row = await prisma.product.findFirst({
      where: { id, ...notDeleted },
      include: productInclude,
    });
    return row ? mapCustomerProduct(row) : null;
  },

  async getBySlug(slug, collection) {
    return remember(`product:slug:${collection ?? "all"}:${slug}`, async () => {
      const row = await prisma.product.findFirst({
        where: { slug, ...notDeleted, ...(collection && { collection }) },
        include: productInclude,
      });

      return row ? mapCustomerProduct(row) : null;
    });
  },

  async getByCategory(categorySlug) {
    const rows = await prisma.product.findMany({
      where: {
        ...activeProductWhere,
        category: {
          slug: categorySlug,
          deletedAt: null,
        },
      },
      include: productInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return mapProducts(rows);
  },

  async getNewArrivals(limit = 8, collection) {
    return remember(
      `products:new:${collection ?? "all"}:${limit}`,
      async () => {
        const rows = await prisma.product.findMany({
          where: {
            ...activeProductWhere,
            isNew: true,
            ...(collection && { collection }),
          },
          include: productInclude,
          orderBy: {
            createdAt: "desc",
          },
        });

        const products = mapProducts(rows, {
          includeInvalid: true,
        });

        const validProducts = products.filter(
          (product) => product.imageValidation?.isValid,
        );

        const invalidProducts = products.filter(
          (product) => !product.imageValidation?.isValid,
        );

        return [...validProducts, ...invalidProducts].slice(0, limit);
      },
    );
  },

  async getTrending(limit = 8, collection) {
    return remember(
      `products:trending:${collection ?? "all"}:${limit}`,
      async () => {
        const rows = await prisma.product.findMany({
          where: {
            ...activeProductWhere,
            isTrending: true,
            ...(collection && { collection }),
          },
          include: productInclude,
          orderBy: {
            purchaseCount: "desc",
          },
        });

        const products = mapProducts(rows, {
          includeInvalid: true,
        });

        const validProducts = products.filter(
          (product) => product.imageValidation?.isValid,
        );

        const invalidProducts = products.filter(
          (product) => !product.imageValidation?.isValid,
        );

        return [...validProducts, ...invalidProducts].slice(0, limit);
      },
    );
  },

  async getBestSellers(limit = 8, collection) {
    return remember(
      `products:bestsellers:${collection ?? "all"}:${limit}`,
      async () => {
        const rows = await prisma.product.findMany({
          where: {
            ...activeProductWhere,
            ...(collection && { collection }),
          },
          include: productInclude,
          orderBy: {
            purchaseCount: "desc",
          },
        });

        const products = mapProducts(rows, {
          includeInvalid: true,
        });

        const validProducts = products.filter(
          (product) => product.imageValidation?.isValid,
        );

        const invalidProducts = products.filter(
          (product) => !product.imageValidation?.isValid,
        );

        // Prefer products with valid images.
        // Keep invalid products only as fallback if there are not enough valid ones.
        return [...validProducts, ...invalidProducts].slice(0, limit);
      },
    );
  },

  async getRelated(productId, limit = 4) {
    const current = await prisma.product.findFirst({
      where: { id: productId, ...notDeleted },
      include: { category: true },
    });

    if (!current) return [];

    const rows = await prisma.product.findMany({
      where: {
        ...activeProductWhere,
        id: {
          not: productId,
        },
        OR: [
          {
            categoryId: current.categoryId,
          },
          {
            tags: {
              hasSome: current.tags,
            },
          },
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
    const rows = await prisma.product.findMany({
      where: notDeleted,
      select: {
        slug: true,
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          select: { url: true },
        },
      },
    });
    return rows
      .filter((product) => validateProductImages(product.images).isValid)
      .map(({ slug }) => ({ slug }));
  },

  /** Lightweight catalog for search modal (no variants/colors join) */
  async getSearchCatalog() {
    const rows = await prisma.product.findMany({
      where: activeProductWhere,
      select: {
        id: true,
        collection: true,
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
      const imageValidation = validateProductImages(p.images);
      return {
        id: p.id,
        collection: p.collection,
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
        imageValidation,
        sizes: p.sizes.map((s) => s.size).sort((a, b) => a - b),
        colors: p.colors.map((c) => ({
          id: c.colorKey,
          label: c.label,
          hex: c.hex,
        })),
      };
    }).filter((product) => product.imageValidation.isValid);
  },

  async getSimilarBySlug(slug, limit = 4) {

    const product = await this.getBySlug(slug);

    if (!product) return [];

    const min = Math.floor(product.price * 0.8);
    const max = Math.ceil(product.price * 1.2);

    const rows = await prisma.product.findMany({
      where: {
        ...activeProductWhere,
        id: {
          not: product.id,
        },
        category: {
          slug: product.category,
          deletedAt: null,
        },
        price: {
          gte: min,
          lte: max,
        },
      },
      include: productInclude,
      take: limit,
      orderBy: {
        purchaseCount: "desc",
      },
    });

    return mapProducts(rows);
  },

  async getByBrand(brand, excludeId, limit = 4) {

    const rows = await prisma.product.findMany({
      where: {
        ...activeProductWhere,
        brand,
        id: {
          not: excludeId,
        },
      },
      include: productInclude,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return mapProducts(rows);
  },

  async getByIds(ids, limit = 4) {

    const unique = [...new Set(ids)]
      .filter(Boolean)
      .slice(0, limit);

    if (!unique.length) return [];

    const rows = await prisma.product.findMany({
      where: {
        ...activeProductWhere,
        id: {
          in: unique,
        },
      },
      include: productInclude,
    });

    const order = new Map(unique.map((id, i) => [id, i]));

    return mapProducts(rows).sort(
      (a, b) =>
        (order.get(a.id) ?? 99) -
        (order.get(b.id) ?? 99)
    );
  },

  async getProducts({ collection, category }) {
    return remember(
      `products:list:${collection ?? "all"}:${category ?? "all"}`,
      async () => {
        const where = {
          ...activeProductWhere,
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

        const products = mapProducts(rows, {
          includeInvalid: true,
        });

        return products;
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
