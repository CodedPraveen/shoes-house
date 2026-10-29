import { checkoutRouteError, readCheckoutPayload, rejectCrossSiteRequest } from "@/lib/checkout-route";
import { createCartCheckoutSession } from "@/services/checkout-flow-service";

export async function POST(request) {
  const forbidden = rejectCrossSiteRequest(request);
  if (forbidden) return forbidden;
  const payload = await readCheckoutPayload(request);
  if (!payload) {
    return Response.json({ ok: false, error: "Invalid checkout request" }, { status: 400 });
  }

  try {
    const result = await createCartCheckoutSession(payload);
    return Response.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    return checkoutRouteError(error);
  }
}
