import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/new-arrivals(.*)",
  "/trending(.*)",
  "/products(.*)",
  "/category(.*)",
  "/product(.*)",
  "/search(.*)",
  "/contact(.*)",
  "/shipping(.*)",
  "/return(.*)",
  "/faq(.*)",
  "/about(.*)",
  "/journal(.*)",
  "/careers(.*)",
  "/stores(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/orders(.*)",
  "/wishlist(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) || isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req) {
  if (!process.env.CLERK_SECRET_KEY) {
    if (isProtectedRoute(req) || isAdminRoute(req)) {
      const signIn = new URL("/sign-in", req.url);
      signIn.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signIn);
    }
    return NextResponse.next();
  }

  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  return clerkHandler(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
