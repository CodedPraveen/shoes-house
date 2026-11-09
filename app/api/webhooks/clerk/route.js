import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { processClerkWebhookEvent } from "@/lib/clerk-webhook-event";

export async function handleClerkWebhookEvent(event, dependencies = {}) {
  return processClerkWebhookEvent(event, {
    userService: dependencies.userService ?? userService,
    isAdminUser: dependencies.isAdminUser ?? isAdminUser,
  });
}

export async function POST(request) {
  try {
    await assertRateLimit({ prefix: "webhook-clerk", limit: 120, windowMs: 60_000 });

    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "CLERK_WEBHOOK_SECRET not configured" },
        { status: 500 },
      );
    }

    const payload = await request.text();
    const headers = {
      "svix-id": request.headers.get("svix-id"),
      "svix-timestamp": request.headers.get("svix-timestamp"),
      "svix-signature": request.headers.get("svix-signature"),
    };

    const wh = new Webhook(secret);
    let event;
    try {
      event = wh.verify(payload, headers);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    return NextResponse.json(await handleClerkWebhookEvent(event));
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
