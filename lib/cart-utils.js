export function buildCartSummary(items) {
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items, itemCount, subtotal };
}

export function buildGuestLineId(productId, color, size) {
  return `${productId}-${color}-${size}`;
}

export function optimisticAddItem(items, { product, color, size, quantity = 1 }) {
  const lineId = buildGuestLineId(product.id, color, size);
  const existing = items.find((item) => item.id === lineId);
  if (existing) {
    return items.map((item) =>
      item.id === lineId
        ? { ...item, quantity: item.quantity + quantity }
        : item,
    );
  }
  return [
    ...items,
    {
      id: lineId,
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      color,
      size,
      quantity,
    },
  ];
}
