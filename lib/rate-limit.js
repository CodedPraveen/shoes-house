/**
 * In-memory sliding-window rate limiter (per server instance).
 * For multi-region production, use Upstash Redis with the same API shape.
 */
const buckets = new Map();

function prune() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit({ key, limit = 10, windowMs = 60_000 }) {
  prune();
  const now = Date.now();
  let entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  entry.count += 1;

  const allowed = entry.count <= limit;
  const retryAfterMs = Math.max(0, entry.resetAt - now);

  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    retryAfterMs,
  };
}

export async function getRateLimitKey(prefix) {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown";
    return `${prefix}:${ip}`;
  } catch {
    return `${prefix}:server`;
  }
}

export async function assertRateLimit(options) {
  const key = options.key ?? (await getRateLimitKey(options.prefix));
  const result = rateLimit({ key, limit: options.limit, windowMs: options.windowMs });

  if (!result.allowed) {
    const err = new Error("Too many requests. Please try again later.");
    err.code = "RATE_LIMITED";
    err.retryAfterMs = result.retryAfterMs;
    throw err;
  }

  return result;
}
