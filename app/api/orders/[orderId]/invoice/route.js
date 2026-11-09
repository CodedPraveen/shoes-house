import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { orderService } from "@/services/order-service";
import { invoiceService } from "@/services/invoice-service";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guestOrderAccessService } from "@/services/guest/guest-order-access-service";

export async function GET(request, { params }) {
  const { orderId } = await params;
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const token = new URL(request.url).searchParams.get("token");
  let guestAuthorized = false;
  if (token) {
    const access = await guestOrderAccessService.getOrderAccess(prisma, token, orderId);
    guestAuthorized = access.status === "valid";
    if (access.status === "expired") {
      return NextResponse.json({ error: "Order link expired" }, { status: 410 });
    }
  }

  let clerkId = null;
  let clerkUser = null;
  let dbUser = null;
  if (!guestAuthorized) {
    ({ userId: clerkId } = await auth());
    if (!clerkId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    [clerkUser, dbUser] = await Promise.all([
      currentUser(),
      userService.getByClerkId(clerkId),
    ]);
  }

  const order = await orderService.getById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = dbUser?.id === order.userId;
  const isAdmin = isAdminUser(clerkUser);

  if (!guestAuthorized && !isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await invoiceService.getInvoiceData(orderId);
  const html = invoiceService.buildInvoiceHtml(data);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="invoice-${data.orderNumber}.html"`,
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
    },
  });
}
