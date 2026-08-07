// import Redis from "ioredis";

// const globalForRedis = globalThis;

// let redis = null;

// if (process.env.REDIS_URL) {
//     redis =
//         globalForRedis.redis ??
//         new Redis(process.env.REDIS_URL, {
//             lazyConnect: true,

//             // immediately fail
//             maxRetriesPerRequest: 0,

//             // never reconnect forever
//             retryStrategy: null,

//             reconnectOnError: () => false,

//             enableReadyCheck: false,

//             connectTimeout: 1000,
//         });

//     redis.on("error", () => { });

//     if (process.env.NODE_ENV !== "production") {
//         globalForRedis.redis = redis;
//     }
// }

// export default redis;

import Redis from "ioredis";

const globalForRedis = globalThis;

const redis =
    globalForRedis.redis ??
    new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

export default redis;