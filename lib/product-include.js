/** Shared Prisma include for product queries */
export const productInclude = {
  category: true,
  images: {
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
  },
  colors: true,
  sizes: true,
  variants: {
    where: { deletedAt: null, isActive: true },
  },
};
