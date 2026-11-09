import { createHash, randomUUID } from "node:crypto";
import redis from "../lib/redis/redis.js";
import {
  decryptNotificationToken,
  encryptNotificationToken,
} from "./notifications/notification-token-crypto.js";

const RESULT_TTL_SECONDS = 60 * 60;
const LOCK_TTL_SECONDS = 30;
const REDIS_TIMEOUT_MS = 1500;
const KEY_PATTERN = /^[A-Za-z0-9_-]{16,100}$/;

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function checkoutPayloadFingerprint(value) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function bounded(promise) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeout = setTimeout(() => reject(new Error("Redis operation timed out")), REDIS_TIMEOUT_MS);
      timeout.unref?.();
    }),
  ]);
}

function decodeRecord(raw, fingerprint) {
  if (!raw) return null;
  const record = JSON.parse(raw);
  if (record.fingerprint !== fingerprint) {
    throw new Error("Checkout idempotency key was already used for different details");
  }
  return JSON.parse(decryptNotificationToken(record.encryptedResult));
}

async function releaseOwnedLock(lockKey, owner) {
  await bounded(redis.eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
    1,
    lockKey,
    owner,
  )).catch(() => null);
}

export async function runCheckoutIdempotent({ scope, key, payload, task }) {
  if (!key) return task();
  if (!KEY_PATTERN.test(key)) throw new Error("Invalid checkout idempotency key");

  const fingerprint = checkoutPayloadFingerprint(payload);
  const resultKey = `checkout:idempotency:${scope}:${key}`;
  const lockKey = `${resultKey}:lock`;
  const owner = randomUUID();

  try {
    if (redis.status === "wait") await bounded(redis.connect());
    const cached = decodeRecord(await bounded(redis.get(resultKey)), fingerprint);
    if (cached) return { ...cached, duplicateSubmission: true };

    const acquired = await bounded(redis.set(lockKey, owner, "EX", LOCK_TTL_SECONDS, "NX"));
    if (acquired !== "OK") {
      throw new Error("Checkout request is already being processed. Please retry shortly.");
    }
  } catch (error) {
    if (error.message?.includes("idempotency key") || error.message?.includes("already being processed")) {
      throw error;
    }
    // PostgreSQL stock guards remain authoritative if Redis is unavailable.
    return task();
  }

  try {
    const cached = decodeRecord(await bounded(redis.get(resultKey)), fingerprint);
    if (cached) return { ...cached, duplicateSubmission: true };

    const result = await task();
    if (result?.ok && result.orderId) {
      const encryptedResult = encryptNotificationToken(JSON.stringify(result));
      await bounded(redis.set(
        resultKey,
        JSON.stringify({ fingerprint, encryptedResult }),
        "EX",
        RESULT_TTL_SECONDS,
      )).catch(() => null);
    }
    return result;
  } finally {
    await releaseOwnedLock(lockKey, owner);
  }
}
