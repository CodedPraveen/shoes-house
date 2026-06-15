import { prisma } from "@/lib/db";
import { productInclude } from "@/lib/product-include";
import { mapProduct } from "@/lib/mappers/product-mapper";
import { ensureUniqueProductSlug, slugify } from "@/lib/slugify";
import { notDeleted } from "@/lib/prisma-helpers";
function buildVariantRows(slug, colors, sizes, stockPerVariant) {
  const rows = [];
  for (const color of colors) {
    for (const size of sizes) {
      const sku = `AERE-${slug}-${color.colorKey}-${size}`.toUpperCase();
      rows.push({
        sku,
        colorKey: color.colorKey,
        size: Number(size),
        stock: Number(stockPerVariant) || 0,
        isActive: true,
      });
    }
  }
  return rows;
}

function normalizeImages(imageUrls = []) {
  return imageUrls
    .filter(Boolean)
    .map((url, index) => ({
      url: String(url).trim(),
      alt: null,
      sortOrder: index,
      isHover: index === 1,
    }));
}

export const productAdminService = {
  async listCategories() {
    return prisma.category.findMany({
      where: { ...notDeleted },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
  },

  async getForEdit(id) {
    const row = await prisma.product.findFirst({
      where: { id, ...notDeleted },
      include: {
        ...productInclude,
        variants: { where: { deletedAt: null } },
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
    const category = await prisma.category.findFirst({
      where: { slug: input.categorySlug, ...notDeleted },
    });
    if (!category) throw new Error("Category not found");

    const slug = await ensureUniqueProductSlug(
      prisma,
      input.slug || slugify(input.name),
    );

    const colors = input.colors || [];
    const sizes = (input.sizes || []).map(Number);
    const variantRows = buildVariantRows(
      slug,
      colors,
      sizes,
      input.stockPerVariant ?? 0,
    );
    const totalStock = variantRows.reduce((s, v) => s + v.stock, 0);
    const images = normalizeImages(input.imageUrls);

    if (!images.length) {
      throw new Error("At least one product image is required");
    }

    const created = await prisma.product.create({
      data: {
        name: input.name,
        brand: input.brand || "Shoes House",
        slug,
        description: input.description,
        price: Number(input.price),
        compareAtPrice: input.compareAtPrice
          ? Number(input.compareAtPrice)
          : null,
        discount: input.discount ? Number(input.discount) : null,
        stock: totalStock,
        isNew: Boolean(input.isNew),
        isTrending: Boolean(input.isTrending),
        materials: input.materials || null,
        shippingInfo: input.shippingInfo || null,
        returnPolicy: input.returnPolicy || null,
        tags: input.tags || [],
        categoryId: category.id,
        images: { create: images },
        colors: {
          create: colors.map((c) => ({
            colorKey: c.colorKey,
            label: c.label,
            hex: c.hex,
          })),
        },
        sizes: { create: sizes.map((size) => ({ size })) },
        variants: { create: variantRows },
      },
      include: { ...productInclude, variants: true },
    });

    for (const variant of created.variants) {
      if (variant.stock > 0) {
        await prisma.inventoryMovement.create({
          data: {
            variantId: variant.id,
            quantity: variant.stock,
            type: "RESTOCK",
            reason: "Initial product creation",
          },
        });
      }
    }

    return mapProduct(created);
  },

  async update(id, input) {
    const existing = await prisma.product.findFirst({
      where: { id, ...notDeleted },
      include: { variants: true },
    });
    if (!existing) throw new Error("Product not found");

    const category = await prisma.category.findFirst({
      where: { slug: input.categorySlug, ...notDeleted },
    });
    if (!category) throw new Error("Category not found");

    const slug = await ensureUniqueProductSlug(
      prisma,
      input.slug || slugify(input.name),
      id,
    );

    const colors = input.colors || [];
    const sizes = (input.sizes || []).map(Number);
    const variantRows = buildVariantRows(
      slug,
      colors,
      sizes,
      input.stockPerVariant ?? 0,
    );
    const totalStock = variantRows.reduce((s, v) => s + v.stock, 0);
    const images = normalizeImages(input.imageUrls);

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productColor.deleteMany({ where: { productId: id } });
      await tx.productSize.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({where: { productId: id }});
      // await tx.productVariant.updateMany({
      //   where: { productId: id },
      //   data: { deletedAt: new Date(), isActive: false },
      // });

      await tx.productVariant.updateMany({
        where: { productId: id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });
      

      await tx.product.update({
        where: { id },
        data: {
          name: input.name,
          brand: input.brand || "Shoes House",
          slug,
          description: input.description,
          price: Number(input.price),
          compareAtPrice: input.compareAtPrice
            ? Number(input.compareAtPrice)
            : null,
          discount: input.discount ? Number(input.discount) : null,
          stock: totalStock,
          isNew: Boolean(input.isNew),
          isTrending: Boolean(input.isTrending),
          materials: input.materials || null,
          shippingInfo: input.shippingInfo || null,
          returnPolicy: input.returnPolicy || null,
          tags: input.tags || [],
          categoryId: category.id,
          images: { create: images },
          colors: {
            create: colors.map((c) => ({
              colorKey: c.colorKey,
              label: c.label,
              hex: c.hex,
            })),
          },
          sizes: { create: sizes.map((size) => ({ size })) },
          variants: { create: variantRows },
        },
      });
    });

    const row = await prisma.product.findFirst({
      where: { id },
      include: productInclude,
    });
    return mapProduct(row);
  },

  async softDelete(id) {
    const now = new Date();
    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.productVariant.updateMany({
        where: { productId: id },
        data: { deletedAt: now, isActive: false },
      }),
      prisma.productImage.updateMany({
        where: { productId: id },
        data: { deletedAt: now },
      }),
    ]);
    return { ok: true };
  },
};
