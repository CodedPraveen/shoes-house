import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (req.nextUrl.pathname.startsWith("/orders/")) {
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("Cache-Control", "no-store, private");
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!api/admin/product-upload/?$|.*\\..*|_next).*)",
    "/",
  ],
};
