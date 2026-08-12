# Feature Status

Status reflects source code inspected on 2026-08-10.

## Complete

- [x] Clerk customer authentication and verified Clerk user webhook.
- [x] Shoe and jewellery collection/category hierarchy.
- [x] Product catalog, variants, product pages, search, and filtering.
- [x] Guest and signed-in cart behavior.
- [x] Wishlist and recently viewed state.
- [x] Saved addresses and checkout address validation.
- [x] Separate cart and Buy Now checkout modes.
- [x] Razorpay order creation, payment signature verification, and webhook processing.
- [x] Payment idempotency and amount verification.
- [x] Orders, immutable order items, order history, and HTML invoices.
- [x] Paid-order atomic inventory decrement and inventory movement audit.
- [x] Cash on Delivery order creation and new-admin call-confirmation workflow.
- [x] Existing `/admin` system.
- [x] Protected `/new-admin` operations system.
- [x] Server-side Cloudinary device uploads for new-admin product images.
- [x] Product image ordering and edit preservation.
- [x] Central product-image validation, storefront filtering, SafeImage fallback, and new-admin failure reporting.
- [x] India Post tracking through AfterShip, including webhook and manual refresh.
- [x] Newsletter subscription and admin subscriber visibility.
- [x] Searchable developer-facing `/docs` web route.

## Partial

- [~] Inventory: paid fulfillment is atomic, but new-admin adjustment UI is not implemented and COD stock accounting is incomplete.
- [~] Reviews: schema and guarded placeholder action exist; submission/display UI is planned.
- [~] Refunds: service foundation exists; no finished admin refund workflow.
- [~] Product image lifecycle: database removal works, but successful removal does not destroy the Cloudinary asset.
- [~] Rate limiting: implemented in memory per process, not as a complete multi-instance control.

## Not verified by source-only validation

- Current production deployment health.
- Signed-in admin/customer behavior against real Clerk test identities.
- Live database migrations and seed state.
- Real Cloudinary, Razorpay, and AfterShip integration credentials.
- Full end-to-end browser test coverage; no automated E2E suite was found.
