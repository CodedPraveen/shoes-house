export function isCodMethod(method = "") {
  const value = method.toLowerCase();
  return value.includes("cash on delivery") || value === "cod" || value.includes("cod");
}

export function getPrimaryPayment(order) {
  return order?.payments?.find((payment) => !payment.deletedAt) ?? order?.payments?.[0] ?? null;
}

export function isCodOrder(order) {
  return isCodMethod(getPrimaryPayment(order)?.paymentMethod);
}

export function isOnlinePaidOrder(order) {
  const payment = getPrimaryPayment(order);
  return Boolean(payment?.status === "PAID" && !isCodMethod(payment.paymentMethod));
}

export function isRealizedOrder(order) {
  if (!order || order.status === "CANCELLED") return false;
  return isOnlinePaidOrder(order) || (isCodOrder(order) && order.status === "DELIVERED");
}

export function getWorkflowLabel(order) {
  if (order.status === "SHIPPED") {
    if (order.trackingStatus === "IN_TRANSIT") return "In transit";
    if (order.trackingStatus === "OUT_FOR_DELIVERY") return "Out for delivery";
    return "In transit";
  }
  return getOrderStatusConfig(order.status).adminLabel;
}

export function serializeOrder(order) {
  const payment = getPrimaryPayment(order);
  return {
    ...order,
    user: order.user ? {
      ...order.user,
      createdAt: order.user.createdAt?.toISOString?.() ?? order.user.createdAt,
      updatedAt: order.user.updatedAt?.toISOString?.() ?? order.user.updatedAt,
      deletedAt: order.user.deletedAt?.toISOString?.() ?? order.user.deletedAt,
    } : order.user,
    items: order.items?.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
      deletedAt: item.deletedAt?.toISOString?.() ?? item.deletedAt,
    })),
    payments: order.payments?.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
      updatedAt: item.updatedAt?.toISOString?.() ?? item.updatedAt,
      deletedAt: item.deletedAt?.toISOString?.() ?? item.deletedAt,
      refundedAt: item.refundedAt?.toISOString?.() ?? item.refundedAt,
    })),
    checkpoints: order.checkpoints?.map((item) => ({
      ...item,
      checkpointTime: item.checkpointTime?.toISOString?.() ?? item.checkpointTime,
      createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    })),
    statusHistory: order.statusHistory?.map((item) => ({
      ...item,
      createdAt: item.createdAt?.toISOString?.() ?? item.createdAt,
    })),
    createdAt: order.createdAt?.toISOString?.() ?? order.createdAt,
    updatedAt: order.updatedAt?.toISOString?.() ?? order.updatedAt,
    confirmedAt: order.confirmedAt?.toISOString?.() ?? order.confirmedAt,
    shippedAt: order.shippedAt?.toISOString?.() ?? order.shippedAt,
    deliveredAt: order.deliveredAt?.toISOString?.() ?? order.deliveredAt,
    lastTrackingSync: order.lastTrackingSync?.toISOString?.() ?? order.lastTrackingSync,
    paymentStatus: payment?.status ?? "PENDING",
    paymentMethod: payment?.paymentMethod ?? "Unknown",
    isCod: isCodMethod(payment?.paymentMethod),
    workflowLabel: getWorkflowLabel(order),
    workflow: getOrderStatusConfig(order.status),
  };
}
import { getOrderStatusConfig } from "@/lib/order-status";
