export function mobileOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    createdAt: order.createdAt,
    shipping: {
      fullName: order.shipFullName,
      phone: order.shipPhone,
      line1: order.shipLine1,
      line2: order.shipLine2,
      landmark: order.shipLandmark,
      city: order.shipCity,
      state: order.shipState,
      country: order.shipCountry,
      pincode: order.shipPincode,
    },
    tracking: {
      number: order.trackingNumber,
      status: order.trackingStatus,
      url: order.trackingUrl,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      checkpoints: order.checkpoints?.map((checkpoint) => ({
        time: checkpoint.checkpointTime,
        location: checkpoint.location,
        message: checkpoint.message,
        tag: checkpoint.tag,
      })) ?? [],
    },
    items: order.items?.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      name: item.productName,
      image: item.productImage,
      sku: item.productSku,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: item.priceAtPurchase,
    })) ?? [],
    paymentStatus: order.payments?.find((payment) => payment.status === "PAID")?.status
      ?? order.payments?.[0]?.status ?? "PENDING",
  };
}
