# Feature Status

Status reflects the documented source inspection baseline. Re-check the current branch before changing a status; documentation alone does not prove production deployment.

## Complete

- [x] Clerk customer authentication and verified Clerk user webhook — current implementation; customer-facing login is targeted for removal.
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
- [x] Cash on Delivery order creation and new-admin call-confirmation workflow.
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

- [~] Inventory: paid fulfillment is atomic, but new-admin adjustment UI is not implemented and COD stock accounting is incomplete.
- [~] Reviews: schema and guarded placeholder action exist; submission/display UI is planned.
- [~] Refunds: service foundation exists; no finished admin refund workflow.
- [~] Historical Cloudinary records remain readable but have not been bulk-migrated to local storage.
- [~] Rate limiting: implemented in memory per process, not as a complete multi-instance control.
- [~] Phase 2 mobile API: documented as worktree/not deployed; do not assume production readiness.

## Planned — guest storefront access

- [ ] Remove customer sign-in/sign-up entry points and customer profile UI from the storefront.
- [ ] Ensure guest cart and Buy Now checkout work without Clerk customer identity.
- [ ] Make checkout sessions and orders support guest ownership without creating fake Clerk users.
- [ ] Preserve existing customer-linked historical orders and admin access.
- [ ] Add private order access using a high-entropy token; persist only its hash.
- [ ] Convert customer order detail and invoice access from Clerk-owner auth to private-token authorization.
- [ ] Keep administrator order access protected by Clerk and admin authorization.
- [ ] Integrate Resend transactional order email and private order link delivery.
- [ ] Add migration, integration tests, security tests, and deployment/rollback procedure.

These items are **not implemented** merely because they appear in this list or in `GUEST_CHECKOUT.md`.

## Not verified by source-only validation

- Current production deployment health.
- Signed-in admin/customer behavior against real Clerk test identities.
- Ongoing production database/seed correctness beyond the verified image migration.
- Real Razorpay and AfterShip integration credentials.
- Full end-to-end browser test coverage; no automated E2E suite was found.
- Production guest checkout, private order links, or Resend delivery.
