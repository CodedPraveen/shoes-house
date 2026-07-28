import redis from "./redis";

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

// export async function redisSet(key, value, ttl) {
export async function redisSet(key) {
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

// export async function redisDel(key) {
export async function redisDel(key) {
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

export async function remember(key, ttl, callback) {

    return remember(
        cacheKey,
        () =>
            prisma.product.findMany({
                where,
                include: productInclude,
                orderBy: { createdAt: "desc" },
            }),
        3600
    );
}