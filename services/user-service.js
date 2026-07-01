import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";

export const userService = {
  async upsertFromClerk({ clerkId, email, name, role = "customer" }) {
    const existingByEmail = await prisma.user.findFirst({
      where: { email, ...notDeleted },
    });

    if (existingByEmail) {
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          clerkId,
          name: name || existingByEmail.name,
          deletedAt: null,
        },
      });
    }

    return prisma.user.upsert({
      where: { clerkId },
      update: {
        email,
        name,
        deletedAt: null,
      },
      create: {
        clerkId,
        email,
        name,
        role,
      },
    });
  },

  async getByClerkId(clerkId) {
    return prisma.user.findFirst({
      where: { clerkId, ...notDeleted },
    });
  },

  async getById(id) {
    return prisma.user.findFirst({
      where: { id, ...notDeleted },
    });
  },

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
