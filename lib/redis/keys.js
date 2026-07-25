export const redisKeys = {
    product: (slug) => `v1:product:${slug}`,

    products: (filters = "all") =>
        `v1:products:${filters}`,

    category: (slug) =>
        `v1:category:${slug}`,

    categories: () =>
        "v1:categories",

    trending: () =>
        "v1:products:trending",

    newArrivals: () =>
        "v1:products:new-arrivals",

    search: (query) =>
        `v1:search:${query}`,

    cart: (userId) =>
        `v1:cart:${userId}`,

    lock: (key) =>
        `v1:lock:${key}`,

    rateLimit: (key) =>
        `v1:rate-limit:${key}`,
};