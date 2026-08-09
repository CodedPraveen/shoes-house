"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { isCodMethod } from "@/lib/new-admin/order-utils";
import { attachTrackingToOrder, refreshTrackingStatus } from "@/services/order-service";

function pathsFor(orderId) {
  revalidatePath("/new-admin");
  revalidatePath("/new-admin/orders");
  revalidatePath(`/new-admin/orders/${orderId}`);
}

export async function confirmOrderByCallAction(_previousState, formData) {
  try {
    await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    if (!orderId) throw new Error("Order is required.");
    const result = await prisma.order.updateMany({
      where: { id: orderId, deletedAt: null, status: "PENDING", confirmedByCall: false },
      data: { confirmedByCall: true, confirmedAt: new Date(), status: "PROCESSING" },
    });
    if (result.count !== 1) throw new Error("Order is no longer awaiting confirmation.");
    pathsFor(orderId);
    return { ok: true, message: "Order confirmed and ready for tracking." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to confirm order." };
  }
}

export async function cancelOrderAction(_previousState, formData) {
  try {
    await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const result = await prisma.order.updateMany({
      where: { id: orderId, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] }, trackingNumber: null },
      data: { status: "CANCELLED" },
    });
    if (result.count !== 1) throw new Error("This order can no longer be cancelled here.");
    pathsFor(orderId);
    return { ok: true, message: "Order cancelled." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to cancel order." };
  }
}

export async function addIndiaPostTrackingAction(_previousState, formData) {
  try {
    await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const trackingNumber = String(formData.get("trackingNumber") ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{8,30}$/.test(trackingNumber)) throw new Error("Enter a valid India Post tracking number.");
    const order = await prisma.order.findFirst({ where: { id: orderId, deletedAt: null }, include: { payments: { where: { deletedAt: null }, take: 1 } } });
    if (!order) throw new Error("Order not found.");
    if (order.status === "CANCELLED" || order.status === "DELIVERED") throw new Error("Tracking cannot be added to this order.");
    if (isCodMethod(order.payments[0]?.paymentMethod) && !order.confirmedByCall) throw new Error("Confirm the COD order by call before shipping.");
    await attachTrackingToOrder({ orderId, trackingNumber });
    await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });
    pathsFor(orderId);
    return { ok: true, message: "India Post tracking attached. Order is now sending." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to attach tracking." };
  }
}

export async function refreshIndiaPostTrackingAction(_previousState, formData) {
  try {
    await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const current = await prisma.order.findFirst({ where: { id: orderId, deletedAt: null }, select: { status: true } });
    if (!current) throw new Error("Order not found.");
    if (current.status === "DELIVERED") return { ok: true, message: "Shipment is already delivered." };
    const updated = await refreshTrackingStatus(orderId);
    if (updated.trackingStatus === "DELIVERED") {
      await prisma.order.update({ where: { id: orderId }, data: { status: "DELIVERED", deliveredAt: updated.deliveredAt ?? new Date() } });
    } else if (["IN_TRANSIT", "OUT_FOR_DELIVERY", "SHIPPED"].includes(updated.trackingStatus)) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "SHIPPED" } });
    }
    pathsFor(orderId);
    return { ok: true, message: updated.trackingStatus === "DELIVERED" ? "Delivered. COD revenue is now realized." : "Tracking refreshed." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to refresh tracking." };
  }
}
