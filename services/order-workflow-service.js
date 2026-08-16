import { prisma } from "@/lib/db";
import { getAllowedNextStatuses, ORDER_STATUSES } from "@/lib/order-status";

export class StaleOrderTransitionError extends Error {
  constructor(message = "This order changed since it was loaded. Refresh and try again.") {
    super(message);
    this.name = "StaleOrderTransitionError";
  }
}

function cleanNote(note) {
  const value = typeof note === "string" ? note.trim() : "";
  return value ? value.slice(0, 500) : null;
}

export async function transitionOrderStatus({
  orderId,
  expectedStatus,
  newStatus,
  actor,
  note,
  allowExceptional = false,
}) {
  if (!orderId || !ORDER_STATUSES.includes(newStatus)) {
    throw new Error("Invalid order status transition.");
  }

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, deletedAt: null },
      select: { id: true, status: true, trackingNumber: true },
    });
    if (!order) throw new Error("Order not found.");
    if (expectedStatus && order.status !== expectedStatus) {
      throw new StaleOrderTransitionError();
    }
    if (order.status === newStatus) {
      throw new StaleOrderTransitionError("This order is already in that status.");
    }

    const allowed = getAllowedNextStatuses(order.status, {
      canCancel: !order.trackingNumber,
    });
    if (!allowExceptional && !allowed.includes(newStatus)) {
      throw new Error(`Cannot move an order from ${order.status} to ${newStatus}.`);
    }
    if (newStatus === "CANCELLED" && order.trackingNumber) {
      throw new Error("A tracked shipment cannot be cancelled here.");
    }

    const result = await tx.order.updateMany({
      where: { id: orderId, deletedAt: null, status: order.status },
      data: {
        status: newStatus,
        ...(newStatus === "CONFIRMED" ? { confirmedByCall: true, confirmedAt: new Date() } : {}),
        ...(newStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
      },
    });
    if (result.count !== 1) throw new StaleOrderTransitionError();

    const dbActor = actor?.clerkId
      ? await tx.user.findUnique({ where: { clerkId: actor.clerkId }, select: { id: true } })
      : null;
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        previousStatus: order.status,
        newStatus,
        changedBy: actor?.clerkId || actor?.identifier || "system",
        changedByUserId: dbActor?.id ?? null,
        actorType: actor?.type || "ADMIN",
        note: cleanNote(note),
      },
    });

    return tx.order.findUnique({ where: { id: orderId } });
  });
}

