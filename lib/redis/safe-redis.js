import { safeDbQuery } from "@/lib/db-safe";
import redis from "./redis";

export async function remember(key, ttl, callback) {

    return remember(
        cacheKey,
        () =>
            safeDbQuery(
                async () => {
                    const rows = await prisma.product.findMany({
                        where,
                        include: productInclude,
                        orderBy: { createdAt: "desc" },
                    });

                    return mapProducts(rows);
                },
                [],
                3000 // max wait 3 seconds
            )
    );
}

export async function redisGet(key) {
    if (!redis) return null;

    try {

        if (redis.status === "end") {
            return null;
        }

        if (redis.status === "wait") {
            await redis.connect();
        }

        return await redis.get(key);

    } catch {
        return null;
    }
}

export async function redisSet(key, value, ttl) {
    if (!redis) return null;

    try {
        if (redis.status === "wait") {
            await redis.connect();
        }

        return await redis.set(key, value, {
            EX: ttl,
        });
    } catch {
        return null;
    }
}

export async function redisDel(key) {
    if (!redis) return null;

    try {
        if (redis.status === "wait") {
            await redis.connect();
        }

        return await redis.del(key);
    } catch {
        return null;
    }
}
