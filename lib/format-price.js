export function formatPrice(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceDisplay(product) {
  if (product.priceDisplay) return product.priceDisplay;
  return formatPrice(product.price);
}
