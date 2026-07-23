import { prisma } from "@/lib/db";
import { getCache, setCache } from "@/lib/redis/cache";

export async function getAllCategories() {
    const key = "categories:all";

    const cached = await getCache(key);

    if (cached) return cached;

    const categories = await prisma.category.findMany({
        where: {
            deletedAt: null,
        },
        orderBy: {
            name: "asc",
        },
    });

    await setCache(key, categories, 3600);

    return categories;
}
export const categoryService = {

    async getAll(collection) {
        const key = `categories:${collection}`;

        const cached = await getCache(key);

        if (cached) return cached;

        const categories = await prisma.category.findMany({
            where: {
                deletedAt: null,
                collection,
                parentId: null,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });

        await setCache(key, categories, 3600);

        return categories;
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
        const key = `subcategories:${slug}`;

        const cached = await getCache(key);

        if (cached) return cached;

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
                        imageUrl: true,
                    },
                },
            },
        });

        const result = (category?.children ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            image: item.imageUrl ?? null,
        }));

        await setCache(key, result, 3600);

        return result;
    },

};