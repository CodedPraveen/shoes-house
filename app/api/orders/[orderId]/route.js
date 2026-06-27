import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { orderService } from "@/services/order-service";
import { userService } from "@/services/user-service";
import { isAdminUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(_request, { params }) {
  const { orderId } = await params;
  const order = await orderService.getById(orderId);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { userId: clerkId } = await auth();
  const clerkUser = await currentUser();
  const dbUser = clerkId ? await userService.getByClerkId(clerkId) : null;

  const isOwner = dbUser?.id === order.userId;
  const isAdmin = isAdminUser(clerkUser);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}
