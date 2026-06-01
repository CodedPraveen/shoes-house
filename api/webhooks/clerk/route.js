import { NextResponse } from "next/server";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";

export async function POST(request) {
  try {
    const payload = await request.json();
    const type = payload.type;
    const data = payload.data;

    if (type === "user.created" || type === "user.updated") {
      const email =
        data.email_addresses?.[0]?.email_address ?? data.email_addresses?.[0];
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
      const role = isAdminUser({
        emailAddresses: [{ emailAddress: email }],
        publicMetadata: data.public_metadata,
      })
        ? "admin"
        : "customer";

      await userService.upsertFromClerk({
        clerkId: data.id,
        email: email ?? `unknown-${data.id}@aere.local`,
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
