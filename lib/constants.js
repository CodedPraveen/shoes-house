export const BRAND_NAME = "Post Mart";

export const CATEGORY_SLUGS = ["shoes", "boys", "men", "footwear"];

// export const NAV_LINKS = [
//   { label: "New Arrivals", href: "/new-arrivals" },
//   { label: "Trending", href: "/trending" },
// ];

export const SHOES_NAV_LINKS = [
  { label: "New Arrivals", href: "/shoes/new-arrivals" },
  { label: "Trending", href: "/shoes/trending" },
];

export const JEWELLERY_NAV_LINKS = [
  { label: "New Arrivals", href: "/jewellery/new-arrivals" },
  { label: "Trending", href: "/jewellery/trending" },
];

export const SHOES_CATEGORY = [
  { label: "Shoes", href: "/category/shoes" },
  { label: "Boys", href: "/category/boys" },
  { label: "Men", href: "/category/men" },
  { label: "Footwear", href: "/category/footwear" },
];

export const JEWELLERY_CATEGORY = [
  {
    label: "All Jewellery",
    href: "/jewellery",
  },
  {
    label: "Necklaces",
    href: "/jewellery?category=necklaces",
  },
  {
    label: "Earrings",
    href: "/jewellery?category=earrings",
  },
  {
    label: "Rings",
    href: "/jewellery?category=rings",
  },
  {
    label: "Bracelets",
    href: "/jewellery?category=bracelets",
  },
  {
    label: "Mangalsutra",
    href: "/jewellery?category=mangalsutra",
  },
  {
    label: "Bangles",
    href: "/jewellery?category=bangles",
  },
  {
    label: "Anklets",
    href: "/jewellery?category=anklets",
  },
  {
    label: "Pendants",
    href: "/jewellery?category=pendants",
  },
];

export const CATEGORY_NAV = [
  { label: "Shoes", href: "/category/shoes" },
  { label: "Boys", href: "/category/boys" },
  { label: "Men", href: "/category/men" },
  { label: "Footwear", href: "/category/footwear" },
];

export const PRICE_FILTERS = [
  { id: "above-5000", label: "Above ₹5000", min: 5001, max: Infinity },
  { id: "2000-5000", label: "₹2000 - ₹5000", min: 2000, max: 5000 },
  { id: "1000-2000", label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { id: "below-1000", label: "Below ₹1000", min: 0, max: 999 },
];

export const SIZE_OPTIONS = [30, 32, 34, 36, 38, 40, 42, 44];

export const COLOR_FILTERS = [
  { id: "black", label: "Black", hex: "#111111" },
  { id: "white", label: "White", hex: "#f5f5f5" },
  { id: "red", label: "Red", hex: "#c41e3a" },
  { id: "blue", label: "Blue", hex: "#1e3a8a" },
  { id: "green", label: "Green", hex: "#166534" },
  { id: "gray", label: "Gray", hex: "#9ca3af" },
  { id: "brown", label: "Brown", hex: "#78350f" },
];

export const SORT_OPTIONS = [
  { id: "latest", label: "Latest" },
  { id: "price-asc", label: "Price Low to High" },
  { id: "price-desc", label: "Price High to Low" },
  { id: "popular", label: "Most Popular" },
];

export const PRODUCTS_PER_PAGE = 12;

export const WISHLIST_STORAGE_KEY = "postmart-wishlist-v1";
export const RECENTLY_VIEWED_KEY = "postmart-recently-viewed-v1";

/** Matches Prisma OrderStatus enum; metadata lives in one shared module. */
export { ORDER_STATUSES } from "@/lib/order-status";

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

/** Matches Prisma WebhookLogStatus enum */
export const WEBHOOK_LOG_STATUSES = [
  "INVALID_SIGNATURE",
  "DUPLICATE_EVENT",
  "PAYMENT_AMOUNT_MISMATCH",
  "OUT_OF_STOCK",
  "FULFILLED",
  "PAYMENT_FAILED",
  "IGNORED",
];

/** Matches Prisma InventoryMovementType enum */
export const INVENTORY_MOVEMENT_TYPES = [
  "SALE",
  "RESTOCK",
  "ADMIN_ADJUSTMENT",
  "REFUND",
];

export const CART_STORAGE_KEY = "postmart-cart-v1";
