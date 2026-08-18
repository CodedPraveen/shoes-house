import { notDeleted } from "@/lib/prisma-helpers";

export const activeProductWhere = {
    ...notDeleted,
    processingStatus: "READY",
    stock: {
        gt: 0,
    },
    category: {
        deletedAt: null,
    },
};
