import { z } from "zod";
import { parseMobileJson, invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";
import { createCartCheckoutSession } from "@/services/checkout-flow-service";

const schema = z.strictObject({ addressId: z.string().min(1).max(100) });

export async function POST(request) {
  const body = await parseMobileJson(request, schema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const result = await createCartCheckoutSession({ ...body, paymentMethod: "razorpay" }, user);
    return Response.json(result.ok ? result : { ok: false, error: "Checkout could not be created" }, { status: result.ok ? 200 : 409 });
  }, { mutation: true });
}
