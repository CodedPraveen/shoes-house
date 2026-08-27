import { notDeleted } from "@/lib/prisma-helpers";

export const storefrontProductWhere = {
  ...notDeleted,
  processingStatus: "READY",
  category: {
    deletedAt: null,
  },
};

export const activeProductWhere = {
  ...storefrontProductWhere,
  stock: {
    gt: 0,
  },
};
