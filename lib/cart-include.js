/** Slim Prisma include for cart — avoids full productInclude on every cart mutation */
export const cartItemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      price: true,
      slug: true,
      images: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        take: 2,
        select: { url: true, isHover: true, sortOrder: true },
      },
    },
  },
  variant: {
    select: { id: true, price: true },
  },
};

export const cartInclude = {
  items: {
    where: { deletedAt: null },
    include: cartItemInclude,
  },
};
