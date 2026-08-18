import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";
import {
  firstAddressError,
  validateAddressInput,
} from "@/lib/address-validation";

function validatedAddress(data) {
  const result = validateAddressInput(data);
  if (!result.isValid) {
    throw new Error(firstAddressError(result.errors));
  }
  return result.address;
}

function addressData(data) {
  return {
    label: data.label,
    fullName: data.fullName,
    phone: data.phone,
    line1: data.line1,
    landmark: data.landmark,
    line2: data.line2,
    city: data.city,
    state: data.state,
    country: data.country,
    pincode: data.pincode,
  };
}

export function toCheckoutAddress(row) {
  return {
    label: row.label || "Home",
    fullName: row.fullName,
    phone: row.phone,
    line1: row.line1,
    landmark: row.landmark || null,
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
    return prisma.$transaction(
      async (tx) => {
        const existing = await tx.address.findFirst({
          where: { id: addressId, userId, ...notDeleted },
        });
        if (!existing) return null;

        await tx.address.updateMany({
          where: { userId, ...notDeleted },
          data: { isDefault: false },
        });

        return tx.address.update({
          where: { id: addressId },
          data: { isDefault: true },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  },

  async create(userId, data) {
    const address = validatedAddress(data);

    return prisma.$transaction(
      async (tx) => {
        const activeCount = await tx.address.count({
          where: { userId, ...notDeleted },
        });
        const shouldBeDefault = Boolean(data.isDefault) || activeCount === 0;

        if (shouldBeDefault) {
          await tx.address.updateMany({
            where: { userId, ...notDeleted },
            data: { isDefault: false },
          });
        }

        return tx.address.create({
          data: {
            userId,
            ...addressData(address),
            isDefault: shouldBeDefault,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  },

  async update(userId, addressId, data) {
    const address = validatedAddress(data);

    return prisma.$transaction(
      async (tx) => {
        const existing = await tx.address.findFirst({
          where: { id: addressId, userId, ...notDeleted },
        });
        if (!existing) return null;

        if (data.isDefault) {
          await tx.address.updateMany({
            where: { userId, ...notDeleted },
            data: { isDefault: false },
          });
        }

        return tx.address.update({
          where: { id: addressId },
          data: {
            ...addressData(address),
            isDefault: data.isDefault ?? existing.isDefault,
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  },

  async remove(userId, addressId) {
    return prisma.$transaction(
      async (tx) => {
        const existing = await tx.address.findFirst({
          where: { id: addressId, userId, ...notDeleted },
        });
        if (!existing) return { count: 0 };

        const removed = await tx.address.updateMany({
          where: { id: addressId, userId, ...notDeleted },
          data: { deletedAt: new Date(), isDefault: false },
        });

        if (existing.isDefault) {
          const next = await tx.address.findFirst({
            where: { userId, ...notDeleted },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });
          if (next) {
            await tx.address.update({
              where: { id: next.id },
              data: { isDefault: true },
            });
          }
        }
        return removed;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );
  },
};

export async function saveShippingAddressForUser(db, userId, data) {
  const address = validatedAddress(data);
  const matching = await db.address.findFirst({
    where: {
      userId,
      ...notDeleted,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      landmark: address.landmark,
      line2: address.line2,
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
    },
  });

  if (matching) return matching;

  const activeCount = await db.address.count({
    where: { userId, ...notDeleted },
  });

  return db.address.create({
    data: {
      userId,
      ...addressData(address),
      isDefault: activeCount === 0,
    },
  });
}
