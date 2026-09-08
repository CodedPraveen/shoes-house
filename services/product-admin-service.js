import { prisma } from "@/lib/db";
import { productInclude } from "@/lib/product-include";
import { mapProduct, productImageSource } from "@/lib/mappers/product-mapper";
import { ensureUniqueProductSlug, slugify } from "@/lib/slugify";
import { notDeleted } from "@/lib/prisma-helpers";
import { validateProductImageUrl } from "@/lib/product-image";
import { productCreationInputSchema, productPersistenceInputSchema } from "@/schemas/product.schema";

/**
 * Variants are kept temporarily for size/SKU compatibility.
 *
 * IMPORTANT:
 * - No color dimension.
 * - No stock per variant.
 * - Product.stock is the source of truth for inventory.
 *
 * Checkout and fulfillment use Product.stock; variants only retain the
 * size/SKU and relation compatibility required by historical models.
 */
function buildVariantRows(slug, sizes) {
  return sizes.map((size) => ({
    sku: `Shoes-House-${slug}-${size}`.toUpperCase(),
    colorKey: "",
    size: Number(size),
    stock: 0,
    isActive: true,
  }));
}

function normalizeImages(
  imageUrls = [],
  allowedExistingUrls = new Set(),
) {
  return imageUrls
    .filter(Boolean)
    .map((value, index) => {
      const url = String(value).trim();

      if (
        !allowedExistingUrls.has(url) &&
        !validateProductImageUrl(url).isValid
      ) {
        throw new Error(
          "Product images must be existing images or staged device uploads",
        );
      }

      return {
        url,
        alt: null,
        sortOrder: index,
        isHover: index === 1,
      };
    });
}

function normalizeSizes(sizes = []) {
  return [...new Set(
    sizes
      .map(Number)
      .filter((size) => Number.isFinite(size) && size > 0),
  )].sort((a, b) => a - b);
}

function normalizeStock(stock) {
  const value = Number(stock);

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export const productAdminService = {
  async getUploadCategory(collection, categorySlug) {
    if (
      !["SHOES", "JEWELLERY"].includes(collection) ||
      !/^[a-z0-9-]+$/.test(categorySlug)
    ) {
      return null;
    }

    return prisma.category.findFirst({
      where: {
        collection,
        slug: categorySlug,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        collection: true,
      },
    });
  },

  async getForEdit(id) {
    const row = await prisma.product.findFirst({
      where: {
        id,
        ...notDeleted,
      },
      include: {
        ...productInclude,
        variants: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!row) return null;

    return {
      ...mapProduct(row),
      dbId: row.id,
      categoryId: row.categoryId,
      description: row.description,
      compareAtPrice: row.compareAtPrice,
      discount: row.discount,
      isNew: row.isNew,
      isTrending: row.isTrending,
      tags: row.tags,
      materials: row.materials,
      shippingInfo: row.shippingInfo,
      returnPolicy: row.returnPolicy,
      imageRecords: row.images,
      colorRecords: row.colors,
      sizeRecords: row.sizes,
      variantRecords: row.variants,
    };
  },

  async create(input) {
    input = productCreationInputSchema.parse(input);
    const category = await this.getCategoryBySlug(
      input.categorySlug,
    );

    if (!category || category.deletedAt) {
      throw new Error("Category not found");
    }

    const slug = await ensureUniqueProductSlug(
      prisma,
      input.slug || slugify(input.name),
    );

    const sizes = normalizeSizes(input.sizes);

    const variantRows = buildVariantRows(
      slug,
      sizes,
    );

    /*
     * IMPORTANT:
     *
     * Stock now belongs to Product.
     *
     * Do NOT calculate:
     *
     * colors × sizes × stockPerVariant
     *
     * anymore.
     */
    const stock = normalizeStock(input.stock);

    const images = normalizeImages(
      input.imageUrls,
    );

    if (!images.length) {
      throw new Error(
        "At least one product image is required",
      );
    }

    const created = await prisma.product.create({
      data: {
        name: input.name,
        brand: input.brand || "Post Mart",
        slug,

        description: input.description,

        price: Number(input.price),

        compareAtPrice: input.compareAtPrice
          ? Number(input.compareAtPrice)
          : null,

        discount: input.discount
          ? Number(input.discount)
          : null,

        // PRODUCT-LEVEL STOCK
        stock,

        isNew: Boolean(input.isNew),
        isTrending: Boolean(input.isTrending),

        materials: input.materials || null,
        shippingInfo: input.shippingInfo || null,
        returnPolicy: input.returnPolicy || null,

        tags: input.tags || [],

        categoryId: category.id,
        collection: category.collection,

        images: {
          create: images,
        },

        /*
         * No colors.
         *
         * Existing ProductColor table is intentionally left
         * untouched at schema level for now.
         */
        sizes: {
          create: sizes.map((size) => ({
            size,
          })),
        },

        /*
         * Temporary compatibility variants:
         *
         * one variant per size,
         * no color,
         * stock always 0.
         */
        variants: {
          create: variantRows,
        },
      },

      include: {
        ...productInclude,
        variants: true,
      },
    });

    /*
     * Do NOT create inventory movements here.
     *
     * Inventory will be moved to product-level stock in
     * the next inventory-service step.
     */

    return mapProduct(created);
  },

  async createProcessing(input) {
    
    input = productCreationInputSchema.parse(input);
    const category = await this.getCategoryBySlug(input.categorySlug);

    if (!category || category.deletedAt) {
      throw new Error("Category not found");
    }

    const slug = await ensureUniqueProductSlug(
      prisma,
      input.slug || slugify(input.name),
    );
    const sizes = normalizeSizes(input.sizes);
    const variantRows = buildVariantRows(slug, sizes);

    const created = await prisma.product.create({
      data: {
        name: input.name,
        brand: input.brand || "Post Mart",
        slug,
        description: input.description,
        price: Number(input.price),
        compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null,
        discount: input.discount ? Number(input.discount) : null,
        stock: normalizeStock(input.stock),
        isNew: Boolean(input.isNew),
        isTrending: Boolean(input.isTrending),
        materials: input.materials || null,
        shippingInfo: input.shippingInfo || null,
        returnPolicy: input.returnPolicy || null,
        tags: input.tags || [],
        categoryId: category.id,
        collection: category.collection,
        processingStatus: "PROCESSING",
        processingError: null,
        pendingImageUrls: input.imageUrls,
        sizes: { create: sizes.map((size) => ({ size })) },
        variants: { create: variantRows },
      },
      include: {
        ...productInclude,
        variants: true,
      },
    });
  
    return mapProduct(created);
  },

  async setProcessingJobId(id, jobId) {
    return prisma.product.update({
      where: { id },
      data: { processingJobId: String(jobId) },
      select: { id: true, processingStatus: true, processingJobId: true },
    });
  },

  async markProcessingFailed(id, message) {
    return prisma.product.updateMany({
      where: { id, deletedAt: null, processingStatus: { not: "READY" } },
      data: {
        processingStatus: "FAILED",
        processingError: String(message || "Image processing failed").slice(0, 1000),
      },
    });
  },

  async getProcessingState(id) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        processingStatus: true,
        pendingImageUrls: true,
        processingJobId: true,
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  async markProcessingQueued(id, jobId) {
    return prisma.product.update({
      where: { id },
      data: {
        processingStatus: "PROCESSING",
        processingError: null,
        processingJobId: String(jobId),
      },
      select: { id: true, processingStatus: true, processingJobId: true },
    });
  },

  async beginImageProcessing(id, pendingImageUrls) {
    return prisma.product.update({
      where: { id },
      data: {
        processingStatus: "PROCESSING",
        processingError: null,
        processedAt: null,
        pendingImageUrls,
      },
    });
  },

  async update(id, input, { allowEmptyImages = false } = {}) {
    input = (allowEmptyImages ? productPersistenceInputSchema : productCreationInputSchema).parse(input);
    const existing = await prisma.product.findFirst({
      where: {
        id,
        ...notDeleted,
      },

      include: {
        variants: true,

        images: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!existing) {
      throw new Error("Product not found");
    }

    const category = await this.getCategoryBySlug(
      input.categorySlug,
    );

    if (!category || category.deletedAt) {
      throw new Error("Category not found");
    }

    const slug = await ensureUniqueProductSlug(
      prisma,
      input.slug || slugify(input.name),
      id,
    );

    const sizes = normalizeSizes(input.sizes);

    const variantRows = buildVariantRows(
      slug,
      sizes,
    );

    /*
     * PRODUCT-LEVEL STOCK
     *
     * Never calculate stock from variants.
     */
    const stock = normalizeStock(input.stock);

    const images = normalizeImages(
      input.imageUrls,
      new Set(
        existing.images.map(
          (image) => productImageSource(image),
        ),
      ),
    );

    if (!images.length && !allowEmptyImages) {
      throw new Error(
        "At least one product image is required",
      );
    }

    /*
     * The previous implementation was getting P2028 because
     * the interactive transaction was taking longer than
     * Prisma's default timeout.
     *
     * Also, the old code did:
     *
     * productVariant.deleteMany()
     * productVariant.updateMany()
     *
     * which made the updateMany pointless.
     *
     * This version:
     * - preserves historical variants and colors
     * - refreshes size records
     * - activates one colorless compatibility variant per current size
     * - updates product stock directly
     *
     * with a longer transaction timeout.
     */
    await prisma.$transaction(
      async (tx) => {
        /*
         * ----------------------------------------------------
         * IMAGES
         * ----------------------------------------------------
         */

        const availableImages = new Map();

        for (const image of existing.images) {
          const matches =
            availableImages.get(productImageSource(image)) || [];

          matches.push(image);

          availableImages.set(
            productImageSource(image),
            matches,
          );
        }

        const retainedImageIds = [];

        for (const image of images) {
          const matches =
            availableImages.get(image.url) || [];

          const existingImage = matches.shift();

          if (existingImage) {
            retainedImageIds.push(
              existingImage.id,
            );

            await tx.productImage.update({
              where: {
                id: existingImage.id,
              },

              data: {
                alt: image.alt,
                sortOrder: image.sortOrder,
                isHover: image.isHover,
              },
            });
          } else {
            const createdImage =
              await tx.productImage.create({
                data: {
                  productId: id,
                  ...image,
                },
              });

            retainedImageIds.push(
              createdImage.id,
            );
          }
        }

        await tx.productImage.updateMany({
          where: {
            productId: id,
            deletedAt: null,

            ...(retainedImageIds.length
              ? {
                id: {
                  notIn: retainedImageIds,
                },
              }
              : {}),
          },

          data: {
            deletedAt: new Date(),
          },
        });

        /*
         * ----------------------------------------------------
         * OLD COLORS
         * ----------------------------------------------------
         *
         * New product system no longer creates colors. Existing rows are
         * retained for historical compatibility.
         */
        // Historical color rows remain available for old variants and orders.
        // The active product form does not create or expose new colors.

        /*
         * ----------------------------------------------------
         * OLD SIZES
         * ----------------------------------------------------
         */

        await tx.productSize.deleteMany({
          where: {
            productId: id,
          },
        });

        /*
         * ----------------------------------------------------
         * OLD COMPATIBILITY VARIANTS
         * ----------------------------------------------------
         *
         * Historical variants may be referenced by orders and inventory
         * movements, so they are retained and made inactive. Current sizes
         * receive one active colorless compatibility variant each.
         */
        await tx.productVariant.updateMany({
          where: {
            productId: id,
          },
          data: {
            isActive: false,
            deletedAt: new Date(),
          },
        });

        for (const variant of variantRows) {
          await tx.productVariant.upsert({
            where: {
              productId_colorKey_size: {
                productId: id,
                colorKey: "",
                size: variant.size,
              },
            },
            create: {
              productId: id,
              ...variant,
            },
            update: {
              sku: variant.sku,
              stock: 0,
              isActive: true,
              deletedAt: null,
            },
          });
        }

        /*
         * ----------------------------------------------------
         * PRODUCT
         * ----------------------------------------------------
         */

        await tx.product.update({
          where: {
            id,
          },

          data: {
            name: input.name,

            brand:
              input.brand || "Post Mart",

            slug,

            description:
              input.description,

            price: Number(input.price),

            compareAtPrice:
              input.compareAtPrice
                ? Number(
                  input.compareAtPrice,
                )
                : null,

            discount:
              input.discount
                ? Number(input.discount)
                : null,

            /*
             * SINGLE SOURCE OF TRUTH
             */
            stock,

            isNew:
              Boolean(input.isNew),

            isTrending:
              Boolean(input.isTrending),

            materials:
              input.materials || null,

            shippingInfo:
              input.shippingInfo || null,

            returnPolicy:
              input.returnPolicy || null,

            tags:
              input.tags || [],

            categoryId:
              category.id,

            collection:
              category.collection,

            /*
             * NO colors.create()
             */

            sizes: {
              create: sizes.map(
                (size) => ({
                  size,
                }),
              ),
            },

            /*
             * Temporary size-only compatibility
             * variants. Variant stock remains 0.
             */
          },
        });
      },

      {
        /*
         * Prisma default interactive transaction
         * timeout is too short for this project.
         */
        maxWait: 10_000,
        timeout: 30_000,
      },
    );

    /*
     * Fetch outside the transaction.
     *
     * This keeps the transaction short and avoids
     * unnecessary work while the transaction is open.
     */
    const row = await prisma.product.findFirst({
      where: {
        id,
      },
      include: productInclude,
    });

    if (!row) {
      throw new Error(
        "Product could not be loaded after update",
      );
    }

    return mapProduct(row);
  },

  async softDelete(id) {
    const now = new Date();

    await prisma.$transaction([
      prisma.product.update({
        where: {
          id,
        },

        data: {
          deletedAt: now,
        },
      }),

      prisma.productVariant.updateMany({
        where: {
          productId: id,
        },

        data: {
          deletedAt: now,
          isActive: false,
        },
      }),

      prisma.productImage.updateMany({
        where: {
          productId: id,
        },

        data: {
          deletedAt: now,
        },
      }),

      prisma.productColor.deleteMany({
        where: {
          productId: id,
        },
      }),

      prisma.productSize.deleteMany({
        where: {
          productId: id,
        },
      }),
    ]);

    return {
      ok: true,
    };
  },

  async listParentCategories() {
    return prisma.category.findMany({
      where: {
        parentId: null,
        deletedAt: null,
      },

      orderBy: {
        sortOrder: "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        collection: true,
      },
    });
  },

  async listSubCategories(collection) {
    return prisma.category.findMany({
      where: {
        collection,

        parentId: {
          not: null,
        },

        deletedAt: null,
      },

      orderBy: {
        sortOrder: "asc",
      },

      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });
  },

  async getCategoryBySlug(slug) {
    return prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        collection: true,
        parentId: true,
      },
    });
  },
};
