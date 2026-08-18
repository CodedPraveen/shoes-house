/** Slim Prisma include for cart — avoids full productInclude on every cart mutation */
export const cartItemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      stock: true,
      slug: true,
      images: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        take: 2,
        select: { url: true, isHover: true, sortOrder: true },
      },
    },
  },
};

export const cartInclude = {
  items: {
    where: { deletedAt: null },
    include: cartItemInclude,
  },
};
