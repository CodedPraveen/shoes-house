import { z } from "zod";
import { parseMobileJson, invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";
import { verifyRazorpayPayment } from "@/services/checkout-flow-service";

const schema = z.strictObject({
  razorpayOrderId: z.string().min(1).max(100),
  razorpayPaymentId: z.string().min(1).max(100),
  razorpaySignature: z.string().min(1).max(200),
});

export async function POST(request) {
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const result = await verifyRazorpayPayment(body, user);
    return Response.json(result.ok ? result : { ok: false, pending: Boolean(result.pending), recoverable: Boolean(result.recoverable), error: "Payment is being confirmed; check Orders before retrying" }, { status: result.ok ? 200 : 409 });
  }, { mutation: true });
}
