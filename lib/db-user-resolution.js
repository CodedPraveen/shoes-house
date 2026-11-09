import { isClerkIdentityConflict } from "./clerk-identity-conflict.js";

export async function resolveDbUserFromClerk({
  throwIfMissing = true,
  auth,
  userService,
  clerkClient,
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    if (throwIfMissing) throw new Error("Unauthorized");
    return null;
  }

  let user = await userService.getByClerkId(clerkId);
  if (user) return user;

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkId);
  try {
    user = await userService.upsertFromClerk({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
    });
  } catch (error) {
    if (isClerkIdentityConflict(error) && !throwIfMissing) return null;
    throw error;
  }
  return user;
}
