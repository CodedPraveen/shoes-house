import { z } from "zod";
import { parseMobileJson, invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";
import { requestPhoneOtp } from "@/services/auth/phone-auth-service";
import { phoneRouteError } from "@/lib/mobile-phone-route";

const schema = z.strictObject({ phone: z.string().min(10).max(20) });

export async function POST(request) {
  if (/^Bearer\s+pm_phone_/i.test(request.headers.get("authorization") ?? "")) {
    return Response.json({ error: "Clerk sign-in required" }, { status: 401 });
  }
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      return Response.json(await requestPhoneOtp({ phone: body.phone, ip, purpose: "LINK", userId: user.id }));
    } catch (error) {
      return phoneRouteError(error);
    }
  }, { mutation: true });
}
