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

    // async getSubCategoriesBySlug(slug) {
    //     const category = await prisma.category.findFirst({
    //         where: {
    //             slug,
    //             deletedAt: null,
    //         },
    //         include: {
    //             subCategories: {
    //                 where: {
    //                     deletedAt: null,
    //                 },
    //                 orderBy: {
    //                     sortOrder: "asc",
    //                 },
    //             },
    //         },
    //     });

    //     return category?.subCategories ?? [];
    // },
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
    }
};