import crypto from "node:crypto";
import Redis from "ioredis";

import { getBullMqConnectionOptions } from "@/lib/queues/connection";

const SESSION_TTL_SECONDS = 10 * 60;
const SESSION_PREFIX = "admin-product-upload:";

let redisClient;

function getRedis() {
    if (!redisClient) {
        redisClient = new Redis(
            getBullMqConnectionOptions(),
        );
    }

    return redisClient;
}

function sessionKey(sessionId) {
    return `${SESSION_PREFIX}${sessionId}`;
}

export async function createProductUploadSession(userId) {
    const sessionId = crypto.randomUUID();

    const session = {
        id: sessionId,
        userId,
        images: [],
        createdAt: Date.now(),
    };

    await getRedis().set(
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
        !sessionId.trim()
    ) {
        return null;
    }

    const value = await getRedis().get(
        sessionKey(sessionId),
    );

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        await deleteProductUploadSession(sessionId);
        return null;
    }
}

export async function setProductUploadImages(
    sessionId,
    images,
) {
    const session =
        await getProductUploadSession(sessionId);

    if (!session) {
        throw new Error(
            "Upload session expired. Please try again.",
        );
    }

    session.images = images;

    await getRedis().set(
        sessionKey(sessionId),
        JSON.stringify(session),
        "EX",
        SESSION_TTL_SECONDS,
    );

    return session;
}

export async function deleteProductUploadSession(
    sessionId,
) {
    if (
        typeof sessionId !== "string" ||
        !sessionId.trim()
    ) {
        return;
    }

    await getRedis().del(
        sessionKey(sessionId),
    );
}