"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { isCodMethod } from "@/lib/new-admin/order-utils";
import { getOrderStatusConfig } from "@/lib/order-status";
import { transitionOrderStatus } from "@/services/order-workflow-service";
import { attachTrackingToOrder, refreshTrackingStatus } from "@/services/order-service";

function pathsFor(orderId) {
  revalidatePath("/new-admin");
  revalidatePath("/new-admin/orders");
  revalidatePath(`/new-admin/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
}

function actorFromAdmin(admin) {
  return { clerkId: admin.id, type: "ADMIN" };
}

export async function transitionOrderStatusAction(_previousState, formData) {
  try {
    const admin = await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const expectedStatus = String(formData.get("expectedStatus") ?? "");
    const newStatus = String(formData.get("newStatus") ?? "");
    const note = String(formData.get("note") ?? "");
    await transitionOrderStatus({
      orderId,
      expectedStatus,
      newStatus,
      actor: actorFromAdmin(admin),
      note,
    });
    pathsFor(orderId);
    return { ok: true, message: `Order moved to ${getOrderStatusConfig(newStatus).adminLabel}.` };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to update order." };
  }
}

export async function confirmOrderByCallAction(previousState, formData) {
  formData.set("expectedStatus", "PENDING");
  formData.set("newStatus", "CONFIRMED");
  return transitionOrderStatusAction(previousState, formData);
}

export async function cancelOrderAction(_previousState, formData) {
  try {
    const admin = await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const expectedStatus = String(formData.get("expectedStatus") ?? "");
    await transitionOrderStatus({
      orderId,
      expectedStatus,
      newStatus: "CANCELLED",
      actor: actorFromAdmin(admin),
      note: String(formData.get("note") ?? "Cancelled by administrator"),
    });
    pathsFor(orderId);
    return { ok: true, message: "Order cancelled." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to cancel order." };
  }
}

export async function addIndiaPostTrackingAction(_previousState, formData) {
  try {
    const admin = await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const trackingNumber = String(formData.get("trackingNumber") ?? "").trim().toUpperCase();
    if (!/^[A-Z0-9]{8,30}$/.test(trackingNumber)) throw new Error("Enter a valid India Post tracking number.");
    const order = await prisma.order.findFirst({
      where: { id: orderId, deletedAt: null },
      include: { payments: { where: { deletedAt: null }, take: 1 } },
    });
    if (!order) throw new Error("Order not found.");
    if (order.status !== "READY_TO_SEND") throw new Error("Only an order that is ready to send can be shipped.");
    if (isCodMethod(order.payments[0]?.paymentMethod) && !order.confirmedByCall) {
      throw new Error("Confirm the COD order by call before shipping.");
    }
    await attachTrackingToOrder({ orderId, trackingNumber, expectedStatus: "READY_TO_SEND" });
    await transitionOrderStatus({
      orderId,
      expectedStatus: "READY_TO_SEND",
      newStatus: "SHIPPED",
      actor: actorFromAdmin(admin),
      note: `India Post tracking ${trackingNumber} attached`,
    });
    pathsFor(orderId);
    return { ok: true, message: "Tracking attached. The shipment is now in transit." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to attach tracking." };
  }
}

export async function refreshIndiaPostTrackingAction(_previousState, formData) {
  try {
    const admin = await requireAdmin();
    const orderId = String(formData.get("orderId") ?? "");
    const current = await prisma.order.findFirst({ where: { id: orderId, deletedAt: null }, select: { status: true } });
    if (!current) throw new Error("Order not found.");
    if (current.status === "DELIVERED") return { ok: true, message: "Shipment is already delivered." };
    const updated = await refreshTrackingStatus(orderId);
    if (updated.trackingStatus === "DELIVERED" && current.status === "SHIPPED") {
      await transitionOrderStatus({
        orderId,
        expectedStatus: "SHIPPED",
        newStatus: "DELIVERED",
        actor: actorFromAdmin(admin),
        note: "Delivery confirmed by India Post tracking refresh",
      });
    }
    pathsFor(orderId);
    return { ok: true, message: updated.trackingStatus === "DELIVERED" ? "Delivery confirmed. COD payment remains separately recorded." : "Tracking refreshed." };
  } catch (error) {
    return { ok: false, error: error.message || "Unable to refresh tracking." };
  }
}
