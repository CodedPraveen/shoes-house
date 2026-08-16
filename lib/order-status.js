export const ORDER_STATUS_CONFIG = Object.freeze({
  PENDING: {
    adminLabel: "Confirm by call",
    customerLabel: "Order received",
    description: "Confirmation is required before fulfilment starts.",
    next: "CONFIRMED",
    nextAction: "Confirm the customer/order by phone.",
    buttonLabel: "Confirm order",
    tone: "amber",
  },
  CONFIRMED: {
    adminLabel: "Confirmed",
    customerLabel: "Order confirmed",
    description: "The order is confirmed and can move into preparation.",
    next: "PROCESSING",
    nextAction: "Start preparing and packing the order.",
    buttonLabel: "Start processing",
    tone: "indigo",
  },
  PROCESSING: {
    adminLabel: "Processing",
    customerLabel: "Preparing your order",
    description: "The order is being prepared and packed.",
    next: "READY_TO_SEND",
    nextAction: "Finish packing the order for courier handoff.",
    buttonLabel: "Mark ready to send",
    tone: "blue",
  },
  READY_TO_SEND: {
    adminLabel: "Ready to send",
    customerLabel: "Ready to ship",
    description: "The package is ready to hand to the courier.",
    next: "SHIPPED",
    nextAction: "Add India Post tracking and hand the package to the courier.",
    buttonLabel: "Add tracking / Mark shipped",
    tone: "violet",
  },
  SHIPPED: {
    adminLabel: "In transit",
    customerLabel: "In transit",
    description: "The courier has received the package.",
    next: "DELIVERED",
    nextAction: "Monitor tracking until delivery is confirmed.",
    buttonLabel: "Mark delivered",
    tone: "blue",
  },
  DELIVERED: {
    adminLabel: "Delivered",
    customerLabel: "Delivered",
    description: "The order has been delivered.",
    next: null,
    nextAction: "No fulfilment action is required.",
    buttonLabel: null,
    tone: "emerald",
  },
  CANCELLED: {
    adminLabel: "Cancelled",
    customerLabel: "Cancelled",
    description: "The order was cancelled.",
    next: null,
    nextAction: "No fulfilment action is required.",
    buttonLabel: null,
    tone: "rose",
  },
});

export const ORDER_STATUSES = Object.freeze(Object.keys(ORDER_STATUS_CONFIG));

export function getOrderStatusConfig(status) {
  return ORDER_STATUS_CONFIG[status] ?? {
    adminLabel: "Unknown status",
    customerLabel: "Order status unavailable",
    description: "Refresh the order before taking action.",
    next: null,
    nextAction: "Review this order.",
    buttonLabel: null,
    tone: "slate",
  };
}

export function getAllowedNextStatuses(status, { canCancel = true } = {}) {
  const next = ORDER_STATUS_CONFIG[status]?.next;
  return [next, canCancel && !["SHIPPED", "DELIVERED", "CANCELLED"].includes(status) ? "CANCELLED" : null].filter(Boolean);
}

