import { createHash, createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { phoneAuthProvider, PhoneProviderUnavailableError } from "@/services/auth/phone-auth-provider";

const OTP_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60_000;
const MAX_ATTEMPTS = 5;

export function normalizeIndianPhone(value) {
  if (typeof value !== "string") return null;
  const digits = value.replace(/[\s()-]/g, "");
  const match = /^(?:\+91|91)?([6-9]\d{9})$/.exec(digits);
  if (!match || /^(\d)\1{9}$/.test(match[1])) return null;
  return `+91${match[1]}`;
}

function hashToken(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hashIp(ip) {
  const key = process.env.TWO_FACTOR_API_KEY;
  if (!key) throw new PhoneProviderUnavailableError();
  return createHmac("sha256", key).update(ip || "unknown").digest("hex");
}

export async function requestPhoneOtp({ phone: input, ip, purpose = "LOGIN", userId = null, provider = phoneAuthProvider, db = prisma }) {
  const phone = normalizeIndianPhone(input);
  if (!phone || !["LOGIN", "LINK"].includes(purpose) || (purpose === "LINK" && !userId)) {
    throw Object.assign(new Error("Invalid phone request"), { code: "INVALID_PHONE_REQUEST" });
  }
  if (!provider.configured) throw new PhoneProviderUnavailableError();
  const requestIpHash = hashIp(ip);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
  const resendAfter = new Date(now.getTime() + RESEND_COOLDOWN_MS);

  const challenge = await db.$transaction(async (tx) => {
    const [latest, phoneCount, ipCount] = await Promise.all([
      tx.phoneAuthChallenge.findFirst({ where: { phone }, orderBy: { createdAt: "desc" } }),
      tx.phoneAuthChallenge.count({ where: { phone, createdAt: { gte: new Date(now.getTime() - 10 * 60_000) } } }),
      tx.phoneAuthChallenge.count({ where: { requestIpHash, createdAt: { gte: new Date(now.getTime() - 60 * 60_000) } } }),
    ]);
    if ((latest && latest.resendAfter > now) || phoneCount >= 3 || ipCount >= 20) {
      throw Object.assign(new Error("Please wait before requesting another code"), { code: "OTP_RATE_LIMITED" });
    }
    await tx.phoneAuthChallenge.updateMany({ where: { phone, consumedAt: null }, data: { consumedAt: now } });
    return tx.phoneAuthChallenge.create({
      data: { phone, purpose, userId, requestIpHash, expiresAt, resendAfter },
    });
  }, { isolationLevel: "Serializable" });

  try {
    const providerSessionId = await provider.sendOtp(phone);
    if (typeof providerSessionId !== "string" || !providerSessionId) throw new PhoneProviderUnavailableError();
    await db.phoneAuthChallenge.update({ where: { id: challenge.id }, data: { providerSessionId } });
  } catch (error) {
    await db.phoneAuthChallenge.updateMany({ where: { id: challenge.id, consumedAt: null }, data: { consumedAt: new Date() } });
    throw error;
  }

  return { challengeId: challenge.id, expiresAt, resendAfter };
}

export async function verifyPhoneOtp({ challengeId, otp, expectedPurpose = "LOGIN", expectedUserId = null, provider = phoneAuthProvider, db = prisma }) {
  if (typeof challengeId !== "string" || !/^[A-Za-z0-9_-]{10,100}$/.test(challengeId) ||
      typeof otp !== "string" || !/^\d{4,8}$/.test(otp)) {
    throw Object.assign(new Error("Invalid code"), { code: "INVALID_OTP" });
  }
  if (!provider.configured) throw new PhoneProviderUnavailableError();
  const now = new Date();
  const challenge = await db.phoneAuthChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.purpose !== expectedPurpose ||
      (expectedPurpose === "LINK" && challenge.userId !== expectedUserId)) {
    throw Object.assign(new Error("Invalid challenge"), { code: "INVALID_OTP" });
  }
  const reserved = await db.phoneAuthChallenge.updateMany({
    where: { id: challengeId, purpose: expectedPurpose, userId: challenge.userId, providerSessionId: { not: null }, consumedAt: null, expiresAt: { gt: now }, attempts: { lt: MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (reserved.count !== 1) throw Object.assign(new Error("Code expired or attempts exceeded"), { code: "OTP_EXPIRED" });
  const valid = await provider.verifyOtp(challenge.providerSessionId, otp);
  if (!valid) throw Object.assign(new Error("Invalid code"), { code: "INVALID_OTP" });

  const rawToken = `pm_phone_${randomBytes(48).toString("base64url")}`;
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const user = await db.$transaction(async (tx) => {
    const consumed = await tx.phoneAuthChallenge.updateMany({
      where: { id: challengeId, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (consumed.count !== 1) throw Object.assign(new Error("Code already used"), { code: "OTP_USED" });

    let customer;
    if (challenge.purpose === "LINK") {
      customer = await tx.user.findFirst({ where: { id: challenge.userId, deletedAt: null } });
      if (!customer || !customer.clerkId || (customer.phone && customer.phone !== challenge.phone)) {
        throw Object.assign(new Error("Account cannot be linked"), { code: "LINK_CONFLICT" });
      }
      const owner = await tx.user.findUnique({ where: { phone: challenge.phone } });
      if (owner && owner.id !== customer.id) {
        throw Object.assign(new Error("Phone belongs to another account"), { code: "LINK_CONFLICT" });
      }
      customer = await tx.user.update({ where: { id: customer.id }, data: { phone: challenge.phone } });
    } else {
      customer = await tx.user.findUnique({ where: { phone: challenge.phone } });
      if (customer?.deletedAt) throw Object.assign(new Error("Account unavailable"), { code: "ACCOUNT_UNAVAILABLE" });
      if (!customer) customer = await tx.user.create({ data: { phone: challenge.phone, role: "customer" } });
    }
    if (challenge.purpose === "LOGIN") {
      await tx.phoneSession.create({ data: { userId: customer.id, tokenHash, expiresAt } });
    }
    return customer;
  });
  return { token: challenge.purpose === "LOGIN" ? rawToken : null, expiresAt, userId: user.id };
}

export async function resolvePhoneSession(token, db = prisma) {
  if (typeof token !== "string" || !/^pm_phone_[A-Za-z0-9_-]{64}$/.test(token)) return null;
  const session = await db.phoneSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.deletedAt) return null;
  return session.user;
}

export async function revokePhoneSession(token, db = prisma) {
  if (typeof token !== "string" || !/^pm_phone_[A-Za-z0-9_-]{64}$/.test(token)) return;
  await db.phoneSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
}
