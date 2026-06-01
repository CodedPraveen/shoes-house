/** Domestic shipping — amounts in rupees (same as product prices) */
export const FREE_SHIPPING_THRESHOLD = 2999;
export const FLAT_SHIPPING_COST = 149;

export function calculateShipping(subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FLAT_SHIPPING_COST;
}

/** Razorpay expects amount in paise */
export function toPaise(rupees) {
  return Math.round(rupees * 100);
}

export function fromPaise(paise) {
  return Math.round(paise / 100);
}
