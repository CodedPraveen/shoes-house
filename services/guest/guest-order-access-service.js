import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_HOURS = 168;

function tokenHash(token) {
  return createHash("sha256").update(token, "utf8").digest("hex");
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

  async findOrderByToken(prisma, token) {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
    const candidateHash = tokenHash(token);
    const order = await prisma.order.findFirst({
      where: {
        guestAccessTokenHash: candidateHash,
        guestAccessRevokedAt: null,
        guestAccessExpiresAt: { gt: new Date() },
        deletedAt: null,
      },
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        checkpoints: { orderBy: { checkpointTime: "desc" } },
      },
    });
    if (!order?.guestAccessTokenHash) return null;
    const stored = Buffer.from(order.guestAccessTokenHash, "hex");
    const supplied = Buffer.from(candidateHash, "hex");
    if (stored.length !== supplied.length || !timingSafeEqual(stored, supplied)) return null;
    return order;
  },
};
