import { NextResponse } from "next/server";
import { webhookService } from "@/services/payment/webhook-service";

export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature");
  const webhookEventId = request.headers.get("x-razorpay-event-id");
  const rawBody = await request.text();

  try {
    const result = await webhookService.handleRazorpayEvent(
      rawBody,
      signature,
      webhookEventId,
    );
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[razorpay webhook]", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Webhook error" },
      { status: 500 },
    );
  }
}
