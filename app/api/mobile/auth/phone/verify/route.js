import { z } from "zod";
import { parseMobileJson, invalidMobileRequest } from "@/lib/mobile-api";
import { verifyPhoneOtp } from "@/services/auth/phone-auth-service";
import { phoneRouteError } from "@/lib/mobile-phone-route";

const schema = z.strictObject({ challengeId: z.string().min(10).max(100), otp: z.string().regex(/^\d{4,8}$/) });

export async function POST(request) {
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  try {
    const result = await verifyPhoneOtp(body);
    return Response.json({ token: result.token, expiresAt: result.expiresAt });
  } catch (error) {
    return phoneRouteError(error);
  }
}
