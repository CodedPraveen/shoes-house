import { randomBytes } from "node:crypto";
import redis from "@/lib/redis/redis";

const SESSION_TTL_SECONDS = 10 * 60;
const SESSION_PREFIX = "admin-product-upload:";

const SESSION_ID_PATTERN = /^[a-f0-9]{64}$/;

function sessionKey(sessionId) {
    return `${SESSION_PREFIX}${sessionId}`;
}

export async function createProductUploadSession(userId) {
    const sessionId = randomBytes(32).toString("hex");

    const session = {
        id: sessionId,
        userId,
        images: [],
        createdAt: Date.now(),
    };

    await redis.set(
        sessionKey(sessionId),
        JSON.stringify(session),
        "EX",
        SESSION_TTL_SECONDS,
    );

    return sessionId;
}

export async function getProductUploadSession(sessionId) {
    if (
        typeof sessionId !== "string" ||
        !SESSION_ID_PATTERN.test(sessionId)
    ) {
        return null;
    }

    const value = await redis.get(
        sessionKey(sessionId),
    );

    if (!value) {
        return null;
    }

    try {
        const session = JSON.parse(value);

        if (
            session?.id !== sessionId ||
            typeof session.userId !== "string" ||
            !Array.isArray(session.images) ||
            typeof session.createdAt !== "number"
        ) {
            await deleteProductUploadSession(sessionId);
            return null;
        }

        return session;
    } catch {
        await deleteProductUploadSession(sessionId);
        return null;
    }
}

export async function setProductUploadImages(
    sessionId,
    images,
) {
    if (
        typeof sessionId !== "string" ||
        !SESSION_ID_PATTERN.test(sessionId)
    ) {
        return { ok: false, reason: "expired" };
    }

    const result = await redis.eval(
        `
        local value = redis.call("GET", KEYS[1])

        if not value then
            return -1
        end

        local session = cjson.decode(value)

        if type(session.images) ~= "table" then
            return -1
        end

        if #session.images > 0 then
            return 0
        end

        session.images = cjson.decode(ARGV[1])
        redis.call("SET", KEYS[1], cjson.encode(session), "KEEPTTL")

        return 1
        `,
        1,
        sessionKey(sessionId),
        JSON.stringify(images),
    );

    if (result === 1) {
        return { ok: true };
    }

    return {
        ok: false,
        reason: result === 0 ? "reused" : "expired",
    };
}

export async function deleteProductUploadSession(
    sessionId,
) {
    if (
        typeof sessionId !== "string" ||
        !SESSION_ID_PATTERN.test(sessionId)
    ) {
        return;
    }

    await redis.del(
        sessionKey(sessionId),
    );
}
