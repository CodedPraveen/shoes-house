import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";

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
