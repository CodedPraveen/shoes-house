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
        user: true,
        checkpoints: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id) {
    return prisma.order.findFirst({
      where: {
        id,
        ...notDeleted,
      },
      include: {
        user: true,

        items: {
          where: {
            deletedAt: null,
          },
        },

        payments: {
          where: {
            deletedAt: null,
          },
        },

        checkpoints: {
          orderBy: {
            checkpointTime: "desc",
          },
        },
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
        checkpoints: true,
      },
    });
  },

  async getAllForAdmin() {
    return prisma.order.findMany({
      where: notDeleted,
      include: {
        items: { where: { deletedAt: null } },
        payments: { where: { deletedAt: null } },
        user: true,
        checkpoints: true,
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
  expectedStatus,
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

  let aftershipTrackingId = null;

  try {
    const tracking = await trackingService.createTracking({
      trackingNumber,
      orderNumber: order.orderNumber,
    });

    aftershipTrackingId =
      tracking?.data?.id ??
      tracking?.data?.tracking?.id ??
      null;

  } catch (error) {
    const meta = error.response?.data?.meta;

    if (meta?.code !== 4003) {
      throw error;
    }

    // Tracking already exists in AfterShip.
    // Reuse its ID.
    aftershipTrackingId =
      error.response?.data?.data?.id ?? null;
  }

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      trackingNumber: null,
      ...(expectedStatus ? { status: expectedStatus } : {}),
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
  if (result.count !== 1) {
    throw new Error("This order changed before tracking could be attached. Refresh and try again.");
  }
  return prisma.order.findUnique({ where: { id: orderId } });
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

  await prisma.trackingCheckpoint.deleteMany({
    where: {
      orderId,
    },
  });

  if (Array.isArray(data.checkpoints)) {
    await prisma.trackingCheckpoint.createMany({
      data: data.checkpoints.map((cp) => ({
        orderId,
        checkpointTime: cp.checkpoint_time
          ? new Date(cp.checkpoint_time)
          : null,
        location: cp.location || "",
        message: cp.message || "",
        tag: cp.tag || "",
      })),
    });
  }

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

export async function syncTracking(orderId) {
  if (!orderId) {
    throw new Error("syncTracking(): orderId is undefined");
  }

  const order = await orderService.getById(orderId);

  if (!order) {
    return null;
  }

  if (!order.trackingNumber) {
    return order;
  }

  try {
    const response = await trackingService.getTracking(
      order.trackingNumber,
    );

    const tracking =
      response?.data?.tracking ??
      response?.data;

    if (!tracking) {
      return order;
    }

    const status = normalizeTrackingStatus(
      tracking.tag,
    );

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        trackingStatus: status,
        lastTrackingSync: new Date(),
        deliveredAt:
          status === "DELIVERED"
            ? new Date()
            : order.deliveredAt,
      },
    });

    return await orderService.getById(orderId);
  } catch (error) {
    console.error("Tracking sync failed:", error);

    return order;
  }
}
