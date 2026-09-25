import { PhoneProviderUnavailableError } from "@/services/auth/phone-auth-provider";

export function phoneRouteError(error) {
  if (error instanceof PhoneProviderUnavailableError || error?.code === "PHONE_PROVIDER_UNAVAILABLE") {
    return Response.json({ error: "Phone sign-in is temporarily unavailable" }, { status: 503 });
  }
  if (error?.code === "OTP_RATE_LIMITED") {
    return Response.json({ error: "Please wait before requesting another code" }, { status: 429 });
  }
  if (["INVALID_PHONE_REQUEST", "INVALID_OTP", "OTP_EXPIRED", "OTP_USED"].includes(error?.code)) {
    return Response.json({ error: "Invalid or expired verification request" }, { status: 400 });
  }
  if (error?.code === "LINK_CONFLICT") {
    return Response.json({ error: "This phone cannot be linked automatically" }, { status: 409 });
  }
  return Response.json({ error: "Phone verification failed" }, { status: 503 });
}
