import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slugify-text";

export class CategoryAdminError extends Error {
  constructor(message) {
    super(message);
    this.name = "CategoryAdminError";
  }
}

function categorySlug(name) {
  const slug = slugify(name);

  if (!slug) {
    throw new CategoryAdminError("Category name must contain letters or numbers.");
  }

  return slug;
}

export const categoryAdminService = {
  async list(collection) {
    return prisma.category.findMany({
      where: {
        collection,
        parentId: { not: null },
        deletedAt: null,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        collection: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
    });
  },

  async create({ name, collection }) {
    const slug = categorySlug(name);

    try {
      return await prisma.$transaction(async (tx) => {
        const [parent, existing, lastCategory] = await Promise.all([
          tx.category.findFirst({
            where: { collection, parentId: null, deletedAt: null },
            orderBy: { sortOrder: "asc" },
            select: { id: true },
          }),
          tx.category.findUnique({
            where: { slug },
            select: { id: true },
          }),
          tx.category.aggregate({
            where: { collection, parentId: { not: null }, deletedAt: null },
            _max: { sortOrder: true },
          }),
        ]);

        if (!parent) {
          throw new CategoryAdminError("The selected collection is not configured.");
        }

        if (existing) {
          throw new CategoryAdminError("A category with this name already exists.");
        }

        return tx.category.create({
          data: {
            name,
            slug,
            collection,
            parentId: parent.id,
            sortOrder: (lastCategory._max.sortOrder ?? 0) + 1,
          },
          select: { id: true, name: true, slug: true },
        });
      });
    } catch (error) {
      if (error instanceof CategoryAdminError) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new CategoryAdminError("A category with this name already exists.");
      }
      throw error;
    }
  },

  async update({ id, name, collection }) {
    const category = await prisma.category.findFirst({
      where: {
        id,
        collection,
        parentId: { not: null },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!category) {
      throw new CategoryAdminError("Category not found.");
    }

    // Name-only edits intentionally preserve the category ID, slug, hierarchy,
    // and every relationship that points to this category.
    return prisma.category.update({
      where: { id: category.id },
      data: { name },
      select: { id: true, name: true, slug: true },
    });
  },
};
