import { clerkClient } from "@clerk/nextjs/server";
import { userService } from "@/services/user-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { resolvePhoneSession } from "@/services/auth/phone-auth-service";

export async function withMobileUser(request, action, { mutation = false } = {}) {
  // Native clients send a short-lived Clerk session token. Do not allow a
  // browser cookie to authenticate this mobile-only mutation surface.
  const authorization = request.headers.get("authorization") ?? "";
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const token = authorization.replace(/^Bearer\s+/i, "");
    let user;
    if (token.startsWith("pm_phone_")) {
      user = await resolvePhoneSession(token);
    } else {
      const client = await clerkClient();
      const tokenOnlyRequest = new Request(request.url, { headers: { authorization } });
      const state = await client.authenticateRequest(tokenOnlyRequest, { acceptsToken: "session_token" });
      const clerkId = state.isAuthenticated ? state.toAuth().userId : null;
      if (!clerkId) {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      user = await userService.getByClerkId(clerkId);
      if (!user) {
        const clerkUser = await client.users.getUser(clerkId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) return Response.json({ error: "Account unavailable" }, { status: 403 });
        user = await userService.upsertFromClerk({
          clerkId,
          email,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        });
      }
    }
    if (!user || user.role !== "customer") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (mutation) {
      await assertRateLimit({ key: `mobile-mutation:${user.id}`, limit: 60, windowMs: 60_000 });
    }
    return await action(user);
  } catch (error) {
    if (error?.code === "RATE_LIMITED") {
      return Response.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil(error.retryAfterMs / 1000)) } });
    }
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}

export async function parseMobileJson(request, schema) {
  try {
    const raw = await request.text();
    if (raw.length > 10_000) return null;
    return schema.safeParse(JSON.parse(raw)).data ?? null;
  } catch {
    return null;
  }
}

export const invalidMobileRequest = () => Response.json({ error: "Invalid request" }, { status: 400 });
