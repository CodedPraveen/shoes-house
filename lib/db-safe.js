import { isDatabaseUnavailable, logDatabaseError } from "./db-error";

export async function safeDbQuery(query, fallback, timeout = 3000) {
    try {
        return await Promise.race([
            query(),
            new Promise((resolve) =>
                setTimeout(() => resolve(fallback), timeout)
            ),
        ]);
    } catch (error) {
        console.error(error);
        return fallback;
    }
}