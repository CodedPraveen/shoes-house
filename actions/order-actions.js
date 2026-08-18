"use server";

import { orderService } from "@/services/order-service";
import { isAdminUser } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { requireDbUser } from "@/lib/require-db-user";
import { getOrderStatusConfig } from "@/lib/order-status";
import { transitionOrderStatus } from "@/services/order-workflow-service";

export async function getMyOrdersAction() {
  const user = await requireDbUser();
  const orders = await orderService.getOrdersByUserId(user.id);

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: getOrderStatusConfig(order.status).customerLabel,
    paymentStatus: order.payments[0]?.status ?? "PENDING",
    razorpayPaymentId: order.payments[0]?.razorpayPaymentId,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
  }));
}
export async function generateOrderNumber() {
  const orderNumber = `ORD-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)
    .toUpperCase()}`;

  return orderNumber;
}

export async function updateOrderStatusAction(orderId, status) {
  const clerkUser = await currentUser();
  if (!isAdminUser(clerkUser)) {
    throw new Error("Forbidden");
  }

  return transitionOrderStatus({
    orderId,
    newStatus: status,
    actor: { clerkId: clerkUser.id, type: "ADMIN" },
    note: "Manual transition from legacy admin",
    allowExceptional: true,
  });
}

export async function getAdminOrdersAction() {
  const clerkUser = await currentUser();
  if (!isAdminUser(clerkUser)) {
    throw new Error("Forbidden");
  }

  const orders = await orderService.getAllForAdmin();

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: order.user?.name || order.user?.email || "—",
    email: order.user?.email,
    total: order.total,
    status: order.status,
    paymentStatus: order.payments[0]?.status ?? "PENDING",
    razorpayPaymentId: order.payments[0]?.razorpayPaymentId,
    createdAt: order.createdAt.toISOString(),
  }));
}
