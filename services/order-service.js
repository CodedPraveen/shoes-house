import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import { trackingService } from "@/services/tracking-service";
import { normalizeTrackingStatus } from "@/lib/tracking-status";

export const orderService = {
  async getOrdersByUserId(userId) {
    return prisma.order.findMany({
      where: { userId, ...notDeleted },
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id) {
    return prisma.order.findFirst({
      where: { id, ...notDeleted },
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        user: true,
      },
    });
  },

  async getByOrderNumber(orderNumber) {
    return prisma.order.findFirst({
      where: { orderNumber, ...notDeleted },
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        user: true,
      },
    });
  },

  async getAllForAdmin() {
    return prisma.order.findMany({
      where: notDeleted,
      include: {
        user: true,
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateOrderStatus(orderId, status) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  async softDelete(orderId) {
    return prisma.order.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    });
  },
};

export async function attachTrackingToOrder({
  orderId,
  trackingNumber,
}) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...notDeleted,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.trackingNumber) {
    throw new Error("Tracking already attached.");
  }

  const tracking = await trackingService.createTracking({
    trackingNumber,
    orderNumber: order.orderNumber,
  });

  const aftershipTrackingId =
    tracking?.data?.id ??
    tracking?.data?.tracking?.id ??
    null;

  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      trackingNumber,
      trackingStatus: "SHIPPED",
      shippedAt: new Date(),
      lastTrackingSync: new Date(),
      trackingUrl: `https://www.aftership.com/track/india-post/${trackingNumber}`,
      aftershipTrackingId,
    },
  });
}
export async function refreshTrackingStatus(orderId) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...notDeleted,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (!order.trackingNumber) {
    throw new Error("Tracking number not attached.");
  }

  const tracking = await trackingService.getTracking(
    order.trackingNumber,
  );

  const data =
    tracking?.data?.tracking ??
    tracking?.data ??
    {};

  const tag = normalizeTrackingStatus(data.tag);

  const checkpoint =
    data.checkpoints?.[0] ?? null;

  return prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      trackingStatus: tag,
      deliveredAt:
        tag === "DELIVERED"
          ? new Date()
          : null,
      lastTrackingSync: new Date(),
    },
  });
}