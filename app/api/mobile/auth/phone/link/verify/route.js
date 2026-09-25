import { z } from "zod";
import { parseMobileJson, invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";
import { verifyPhoneOtp } from "@/services/auth/phone-auth-service";
import { phoneRouteError } from "@/lib/mobile-phone-route";

const schema = z.strictObject({ challengeId: z.string().min(10).max(100), otp: z.string().regex(/^\d{4,8}$/) });

export async function POST(request) {
  if (/^Bearer\s+pm_phone_/i.test(request.headers.get("authorization") ?? "")) {
    return Response.json({ error: "Clerk sign-in required" }, { status: 401 });
  }
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      await verifyPhoneOtp({ ...body, expectedPurpose: "LINK", expectedUserId: user.id });
      return Response.json({ linked: true });
    } catch (error) {
      return phoneRouteError(error);
    }
  }, { mutation: true });
}
