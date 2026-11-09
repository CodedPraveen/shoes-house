import { prisma } from "@/lib/db";
import { getAllowedNextStatuses, ORDER_STATUSES } from "@/lib/order-status";
import { incrementProductStock } from "@/services/inventory-service";

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
      include: { items: { where: { deletedAt: null } } },
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

    if (newStatus === "CANCELLED") {
      const [saleMovement, alreadyRestocked] = await Promise.all([
        tx.inventoryMovement.findFirst({ where: { orderId, type: "SALE", quantity: { lt: 0 } }, select: { id: true } }),
        tx.inventoryMovement.findFirst({ where: { orderId, type: { in: ["RESTOCK", "REFUND"] }, quantity: { gt: 0 } }, select: { id: true } }),
      ]);
      if (saleMovement && !alreadyRestocked) {
        for (const item of order.items) {
          if (!item.variantId) continue;
          await incrementProductStock(tx, {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            type: "RESTOCK",
            reason: `Cancellation · order ${orderId}`,
            orderId,
          });
        }
      }
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

