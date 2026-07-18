import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getAllCategories = unstable_cache(
    async () => {
        return prisma.category.findMany({
            where: {
                deletedAt: null,
            },
            orderBy: {
                name: "asc",
            },
        });
    },
    ["categories"],
    {
        revalidate: 3600,
    },
);
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

   async getSubCategoriesBySlug(slug) {
        const category = await prisma.category.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
            include: {
                children: {
                    where: {
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
                },
            },
        });

        return category?.children ?? [];
    },
  
};