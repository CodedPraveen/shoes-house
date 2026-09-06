# Services

Services contain reusable business and data-access logic. Search this directory before creating another service.

## Catalog and products

- `product-service.js` — storefront product reads.
- `product-admin-service.js` — administrator product creation, update, image reconciliation, variants, stock totals, categories, and soft deletion.
- `category-service.js` — category reads.
- `inventory-read-service.js` — inventory read models.
- `inventory-service.js` — atomic decrement, increment, refund, restock, and administrator adjustment primitives.

## Checkout, payment, and fulfillment

- `checkout-service.js` — line building, stock validation, CART/BUY_NOW sessions, Razorpay setup, and COD order creation.
- `order-fulfillment-service.js` — idempotent paid fulfillment, ownership/amount validation, orders, payments, stock movements, and cart clearing.
- `services/payment/razorpay-service.js` — Razorpay client and signature checks.
- `services/payment/payment-idempotency.js` — duplicate-payment detection and logging.
- `services/payment/webhook-service.js` — Razorpay webhook event handling.
- `services/payment/webhook-log-service.js` — webhook audit persistence.
- `refund-service.js` — refund/restock foundation; no finished admin UI.

## Orders and operations

New production-safe operational services:

- `order-workflow-service.js` validates conditional transitions and writes status-history audit records.
- `storefront-service.js` builds ordered product-section, hero, selected-product, and navbar read models; legacy non-product section rows are retained but excluded from product-section rendering.

- `order-service.js` — order reads, tracking attachment, refresh, and tracking synchronization.
- `new-admin-service.js` — dashboards, filtered orders, exports, products, inventory, customers, and newsletter read models.
- `invoice-service.js` — invoice data and HTML generation.
- `tracking-service.js` — AfterShip create/get/delete requests for India Post.

## Customer state

- `cart-service.js` — persisted cart reads and mutations.
- `wishlist-service.js` — wishlist persistence.
- `address-service.js` — owned addresses and checkout-address conversion.
- `user-service.js` — Clerk-to-Prisma user synchronization and lookups.
- `review-service.js` — review data foundation.
- `newsletter-service.js` — subscriptions and admin subscriber reads.

## Media and location

- `services/upload/image-upload-service.js` — validated JPG/PNG staging and cleanup for the shared filesystem/BullMQ image flow.
- `google-geolocation-service.js` and related helpers — Google location integrations.

## Service rules

- Services do not make a client trustworthy; actions/routes must still authorize callers.
- Prefer transactions for multi-model business mutations.
- Preserve idempotency for payment and webhook operations.
- Keep cache invalidation adjacent to successful mutations.
- Do not duplicate Prisma queries inside Client Components.
