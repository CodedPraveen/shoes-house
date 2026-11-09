import { isClerkIdentityConflict } from "./clerk-identity-conflict.js";

export async function processClerkWebhookEvent(event, { userService, isAdminUser }) {
  const type = event.type;
  const data = event.data;
  try {
    if (type === "user.created" || type === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address ?? data.email_addresses?.[0];
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ");
      await userService.upsertFromClerk({
        clerkId: data.id,
        email: email ?? `unknown-${data.id}@postmart.local`,
        name: name || null,
        role: isAdminUser({
          emailAddresses: [{ emailAddress: email }],
          publicMetadata: data.public_metadata,
        }) ? "admin" : "customer",
      });
    }
    if (type === "user.deleted") {
      const user = await userService.getByClerkId(data.id);
      if (user) await userService.softDelete(user.id);
    }
    return { received: true, skipped: false };
  } catch (error) {
    if (isClerkIdentityConflict(error)) {
      return { received: true, skipped: true, reason: "identity_conflict" };
    }
    throw error;
  }
}
