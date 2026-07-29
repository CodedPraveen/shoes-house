import { notDeleted } from "@/lib/prisma-helpers";

export const activeProductWhere = {
    ...notDeleted,
    stock: {
        gt: 0,
    },
    category: {
        deletedAt: null,
    },
};