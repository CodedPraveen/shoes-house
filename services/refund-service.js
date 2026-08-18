/**
 * Refund foundation — implement admin refunds in a future phase.
 * Schema: Payment.refundedAt, Payment.status REFUNDED, Order.refundReason.
 */
import { prisma } from "@/lib/db";
import { incrementProductStock } from "@/services/inventory-service";

export const refundService = {
  /**
   * Placeholder for Phase 5+ admin refunds.
   * Restocks variants and marks payment REFUNDED inside a transaction.
   */
  async processRefund({ orderId, reason, lineItems }) {
    void lineItems;
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payments: { where: { status: "PAID", deletedAt: null } },
        },
      });

      if (!order) throw new Error("Order not found");
      const payment = order.payments[0];
      if (!payment) throw new Error("No paid payment for order");
      if (payment.status === "REFUNDED") {
        return { ok: true, duplicate: true };
      }

      for (const item of order.items) {
        if (!item.variantId) continue;
        await incrementProductStock(tx, {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          type: "REFUND",
          reason: reason ?? `Refund · order ${order.orderNumber}`,
          orderId: order.id,
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: {
          refundReason: reason ?? null,
          status: "CANCELLED",
        },
      });

      if (order.status !== "CANCELLED") {
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus: "CANCELLED",
            changedBy: "refund-service",
            actorType: "SYSTEM",
            note: reason ?? "Order cancelled during refund processing",
          },
        });
      }

      return { ok: true, orderId };
    });
  },
};
