import { revokePhoneSession } from "@/services/auth/phone-auth-service";

export async function POST(request) {
  const authorization = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(pm_phone_[A-Za-z0-9_-]{64})$/i.exec(authorization);
  if (!match) return Response.json({ error: "Authentication required" }, { status: 401 });
  await revokePhoneSession(match[1]);
  return new Response(null, { status: 204 });
}
