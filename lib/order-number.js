import { prisma } from "@/lib/db";

export async function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const prefix = `AERE-${y}${m}${d}`;

  const count = await prisma.order.count({
    where: {
      orderNumber: { startsWith: prefix },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}-${seq}`;
}
