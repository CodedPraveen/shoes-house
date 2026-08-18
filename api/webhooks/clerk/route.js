import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";
import { assertRateLimit } from "@/lib/rate-limit";

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

    const type = event.type;
    const data = event.data;

    if (type === "user.created" || type === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ??
        data.email_addresses?.[0];
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
      const role = isAdminUser({
        emailAddresses: [{ emailAddress: email }],
        publicMetadata: data.public_metadata,
      })
        ? "admin"
        : "customer";

      await userService.upsertFromClerk({
        clerkId: data.id,
        email: email ?? `unknown-${data.id}@postmart.local`,
        name: name || null,
        role,
      });
    }

    if (type === "user.deleted") {
      const user = await userService.getByClerkId(data.id);
      if (user) await userService.softDelete(user.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
