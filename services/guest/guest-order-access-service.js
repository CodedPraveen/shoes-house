import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_HOURS = 168;

function tokenHash(token) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function isTokenShapeValid(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{40,64}$/.test(token);
}

function hashesMatch(token, expectedHash) {
  if (!isTokenShapeValid(token) || !/^[a-f0-9]{64}$/i.test(expectedHash || "")) return false;
  const stored = Buffer.from(expectedHash, "hex");
  const supplied = Buffer.from(tokenHash(token), "hex");
  return stored.length === supplied.length && timingSafeEqual(stored, supplied);
}

export const guestOrderAccessService = {
  createToken() {
    const token = randomBytes(32).toString("base64url");
    const ttlHours = Number(process.env.GUEST_ORDER_TOKEN_TTL_HOURS || DEFAULT_TTL_HOURS);
    const safeTtl = Number.isFinite(ttlHours) && ttlHours >= 1 && ttlHours <= 720
      ? ttlHours
      : DEFAULT_TTL_HOURS;
    return {
      token,
      tokenHash: tokenHash(token),
      expiresAt: new Date(Date.now() + safeTtl * 60 * 60 * 1000),
    };
  },

  validateToken(token, expectedHash) {
    return hashesMatch(token, expectedHash);
  },

  async getOrderAccess(prisma, token, orderId = null) {
    if (!isTokenShapeValid(token)) return { status: "invalid", order: null };
    const candidateHash = tokenHash(token);
    const order = await prisma.order.findFirst({
      where: {
        guestAccessTokenHash: candidateHash,
        ...(orderId ? { id: orderId } : {}),
        deletedAt: null,
      },
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        checkpoints: { orderBy: { checkpointTime: "desc" } },
      },
    });
    if (!order?.guestAccessTokenHash || !hashesMatch(token, order.guestAccessTokenHash)) {
      return { status: "invalid", order: null };
    }
    if (order.guestAccessRevokedAt) return { status: "invalid", order: null };
    if (!order.guestAccessExpiresAt || order.guestAccessExpiresAt <= new Date()) {
      return { status: "expired", order: null };
    }
    return { status: "valid", order };
  },

  async findOrderByToken(prisma, token, orderId = null) {
    const result = await this.getOrderAccess(prisma, token, orderId);
    return result.order;
  },
};
