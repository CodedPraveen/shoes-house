import { NextResponse } from "next/server";
import { webhookService } from "@/services/payment/webhook-service";

export async function POST(request) {
  const signature = request.headers.get("x-razorpay-signature");
  const payload = await request.json();
  const result = await webhookService.handleRazorpayEvent(payload, signature);
  return NextResponse.json(result, { status: 501 });
}
