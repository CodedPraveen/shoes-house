import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/auth";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user || !isAdminUser(user)) {
    throw new Error("Forbidden");
  }
  return user;
}
