import { z } from "zod";
import { parseMobileJson, invalidMobileRequest } from "@/lib/mobile-api";
import { requestPhoneOtp } from "@/services/auth/phone-auth-service";
import { phoneRouteError } from "@/lib/mobile-phone-route";

const schema = z.strictObject({ phone: z.string().min(10).max(20) });

export async function POST(request) {
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    return Response.json(await requestPhoneOtp({ phone: body.phone, ip }));
  } catch (error) {
    return phoneRouteError(error);
  }
}
