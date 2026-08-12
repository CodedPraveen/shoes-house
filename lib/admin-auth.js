import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { isAdminUser } from "@/lib/auth";

export class AdminAuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AdminAuthenticationError";
    this.status = 401;
  }
}

export class AdminAuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AdminAuthorizationError";
    this.status = 403;
  }
}

export function getNewAdminPath() {
  const configured = String(process.env.ADMIN_URL || "/new-admin").trim();
  if (!configured.startsWith("/") || configured.startsWith("//")) {
    return "/new-admin";
  }

  try {
    const url = new URL(configured, "https://admin-path.local");
    if (url.origin !== "https://admin-path.local") return "/new-admin";
    const path = url.pathname.replace(/\/+$/, "") || "/new-admin";
    return path === "/" ? "/new-admin" : path;
  } catch {
    return "/new-admin";
  }
}

export const requireAdmin = cache(async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) {
    throw new AdminAuthenticationError();
  }

  const user = await currentUser();
  if (!user || user.id !== userId) {
    throw new AdminAuthenticationError();
  }
  if (!isAdminUser(user)) {
    throw new AdminAuthorizationError();
  }

  return user;
});

export function getAdminErrorStatus(error) {
  if (error instanceof AdminAuthenticationError) return 401;
  if (error instanceof AdminAuthorizationError) return 403;
  return 500;
}

export async function requireNewAdminPage() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthenticationError) {
      const adminPath = getNewAdminPath();
      const pathname = (await headers()).get("x-pathname") || adminPath;
      const destination =
        pathname === adminPath || pathname.startsWith(`${adminPath}/`)
          ? pathname
          : adminPath;
      redirect(`/sign-in?redirect_url=${encodeURIComponent(destination)}`);
    }
    notFound();
  }
}
