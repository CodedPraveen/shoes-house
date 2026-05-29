/**
 * Order service stub — ready for Prisma / MongoDB integration.
 */

export const orderService = {
  async createOrder() {
    throw new Error("Order service not connected. Implement with database.");
  },

  async getOrdersByUser() {
    return [];
  },
};
