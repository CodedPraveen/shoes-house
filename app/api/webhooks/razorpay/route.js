import { NextResponse } from "next/server";
import { webhookService } from "@/services/payment/webhook-service";

export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature");
  const webhookEventId = request.headers.get("x-razorpay-event-id");
  const rawBody = await request.text();
  console.log("Razorpay Webhook Hit");

  try {
    const result = await webhookService.handleRazorpayEvent(
      rawBody,
      signature,
      webhookEventId,
    );
    if (!result.ok) {
      const status = result.code === "INVALID_SIGNATURE" ? 401 : 400;
      return NextResponse.json(result, { status });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[razorpay webhook]", err);
    console.log(event.event);
    return NextResponse.json(
      { ok: false, error: err.message || "Webhook error" },
      { status: 500 },
    );
  }
}
