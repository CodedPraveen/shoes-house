import { prisma } from "@/lib/db";

export const categoryService = {
    async getAll() {
        return prisma.category.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });
    },

    async getBySlug(slug) {
        return prisma.category.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
        });
    },
};