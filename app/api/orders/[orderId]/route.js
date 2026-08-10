import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { orderService } from "@/services/order-service";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";
import { syncTracking } from "@/services/order-service";

export async function GET(_request, { params }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orderId } = await params;
  if (!/^[A-Za-z0-9_-]{10,64}$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const [clerkUser, dbUser, order] = await Promise.all([
    currentUser(),
    userService.getByClerkId(clerkId),
    orderService.getById(orderId),
  ]);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = dbUser?.id === order.userId;
  const isAdmin = isAdminUser(clerkUser);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(await syncTracking(orderId));
}
