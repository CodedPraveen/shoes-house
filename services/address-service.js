import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";

export function toCheckoutAddress(row) {
  return {
    fullName: row.fullName,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    country: row.country,
    pincode: row.pincode,
  };
}

export const addressService = {
  async listByUser(userId) {
    return prisma.address.findMany({
      where: { userId, ...notDeleted },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async getByIdForUser(userId, addressId) {
    return prisma.address.findFirst({
      where: { id: addressId, userId, ...notDeleted },
    });
  },

  async getDefault(userId) {
    return prisma.address.findFirst({
      where: { userId, isDefault: true, ...notDeleted },
    });
  },

  async setDefault(userId, addressId) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, ...notDeleted },
    });
    if (!existing) return null;

    await prisma.address.updateMany({
      where: { userId, ...notDeleted },
      data: { isDefault: false },
    });

    return prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  },

  async create(userId, data) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, ...notDeleted },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        pincode: data.pincode,
        isDefault: Boolean(data.isDefault),
      },
    });
  },

  async update(userId, addressId, data) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, ...notDeleted },
    });
    if (!existing) return null;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, ...notDeleted },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        pincode: data.pincode,
        isDefault: data.isDefault ?? existing.isDefault,
      },
    });
  },

  async remove(userId, addressId) {
    return prisma.address.updateMany({
      where: { id: addressId, userId },
      data: { deletedAt: new Date() },
    });
  },
};
