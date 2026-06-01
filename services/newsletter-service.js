import { prisma } from "@/lib/db";

export const newsletterService = {
  async subscribe(email) {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("Invalid email");
    }

    return prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { deletedAt: null },
      create: { email: normalized },
    });
  },
};
