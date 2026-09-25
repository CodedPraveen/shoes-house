import { prisma } from "@/lib/db";
import { notDeleted } from "@/lib/prisma-helpers";

export const userService = {
  async upsertFromClerk({ clerkId, email, name, role = "customer" }) {
    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (existing) {
      if (existing.deletedAt) throw new Error("Account unavailable");
      return prisma.user.update({
        where: { id: existing.id },
        data: { email, name: name || existing.name },
      });
    }

    // Email equality is not proof that two independently authenticated
    // identities belong to the same person. Linking has a separate flow.
    const emailOwner = await prisma.user.findUnique({ where: { email } });
    if (emailOwner) throw new Error("Email already belongs to another account");

    return prisma.user.create({
      data: { clerkId, email, name, role },
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
