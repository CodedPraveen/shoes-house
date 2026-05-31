/**
 * Auth helpers — extend when Prisma User roles are added.
 */

export function isAdminUser(user) {
  if (!user) return false;

  const role = user.publicMetadata?.role;
  if (role === "admin") return true;

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = user.emailAddresses?.[0]?.emailAddress?.toLowerCase();
  return email && adminEmails.includes(email);
}
