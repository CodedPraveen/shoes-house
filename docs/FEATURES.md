# Feature Status

Status reflects the documented source inspection baseline. Re-check the current branch before changing a status; documentation alone does not prove production deployment.

## Complete

- [x] Clerk administrator authentication and verified user webhook; customer login/signup entry points are removed from the storefront.
- [x] Shoe and jewellery collection/category hierarchy.
- [x] Product catalog, variants, product pages, search, and filtering.
- [x] Guest and signed-in cart behavior as documented by the current implementation; verify persistence and browser behavior before relying on it.
- [x] Wishlist and recently viewed state.
- [x] Saved addresses and checkout address validation.
- [x] Separate cart and Buy Now checkout modes.
- [x] Razorpay order creation, payment signature verification, and webhook processing.
- [x] Payment idempotency and amount verification.
- [x] Orders, immutable order items, order history, and HTML invoices.
- [x] Paid-order atomic inventory decrement and inventory movement audit.
- [x] Cash on Delivery order creation with atomic inventory movement and new-admin call-confirmation workflow.
- [x] Guest cart and Buy Now checkout for COD and Razorpay.
- [x] Private token order detail and invoice access with expiry/revocation.
- [x] Resend email outbox with idempotency and retry processing.
- [x] Optional consented Meta WhatsApp confirmation isolated from checkout/email.
- [x] Validated seven-state new-admin order workflow with stale-action protection and administrator audit history.
- [x] Admin-managed storefront hero, sections, lifestyle content, selected products, and navbar destinations.
- [x] Persistent product/banner image paths shared by the Next.js and worker containers.
- [x] Explicit checkout consent before a new shipping address is saved.
- [x] Existing `/admin` system.
- [x] Protected `/new-admin` operations system.
- [x] Server-side JPG/PNG staging and BullMQ/Sharp WebP processing for admin product images.
- [x] Product image ordering and edit preservation.
- [x] Central product-image validation, storefront filtering, SafeImage fallback, and new-admin failure reporting.
- [x] India Post tracking through AfterShip, including webhook and manual refresh.
- [x] Newsletter subscription and admin subscriber visibility.
- [x] Searchable developer-facing `/docs` web route.

## Partial

- [~] Inventory: paid/COD fulfillment and cancellation restoration are atomic; new-admin adjustment UI remains unimplemented.
- [~] Reviews: schema and guarded placeholder action exist; submission/display UI is planned.
- [~] Refunds: service foundation exists; no finished admin refund workflow.
- [~] Historical Cloudinary records remain readable but have not been bulk-migrated to local storage.
- [~] Rate limiting: implemented in memory per process, not as a complete multi-instance control.
- [~] Phase 2 mobile API: documented as worktree/not deployed; do not assume production readiness.

## Implemented in Phase 1 — pending independent verification

- [x] Remove customer sign-in/sign-up entry points and customer profile UI from the storefront.
- [x] Guest cart and Buy Now work without Clerk customer identity.
- [x] Checkout sessions/orders support nullable guest ownership without fake users.
- [x] Preserve historical customer orders, mobile contracts, and admin access.
- [x] Add hashed private token access for order details and invoices.
- [x] Integrate Resend and optional consented Meta WhatsApp via isolated outboxes.
- [x] Add additive migrations and environment documentation.
- [ ] Complete Phase 2 integration, security, provider-failure, and production migration tests.

Phase 1 implementation is not a production-readiness claim.

## Not verified by source-only validation

- Current production deployment health.
- Signed-in admin/customer behavior against real Clerk test identities.
- Ongoing production database/seed correctness beyond the verified image migration.
- Real Razorpay and AfterShip integration credentials.
- Full end-to-end browser test coverage; no automated E2E suite was found.
- Production guest checkout, private order links, Resend delivery, or Meta WhatsApp delivery.
