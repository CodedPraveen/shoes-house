# Roadmap and Known Gaps

Priorities: P0 critical, P1 important, P2 useful, P3 later.

## Phase 1 — Stabilization

| Feature | Status | Priority | Description | Dependencies |
| --- | --- | --- | --- | --- |
| COD inventory accounting | Planned | P0 | Atomically decrement stock and write SALE movements for COD without double-decrementing later | Checkout/order lifecycle decision |
| Product variant edit safety | Planned | P0 | Preserve referenced variants and inventory history during product edits | Schema/service migration design |
| Authentication integration tests | Planned | P1 | Test logged-out, customer, and admin page/API/action behavior | Clerk test identities |
| Product upload integration tests | Partial | P1 | Automate one/multiple images, ordering, edit preservation, persistence, and cleanup | Isolated DB and Docker stack |
| Shared rate limiting | Planned | P1 | Replace per-process limits with Redis/Upstash-backed limits | Production Redis choice |
| E2E suite | Planned | P1 | Cover checkout, payment, orders, tracking, and admin access | Stable test environment |

## Phase 2 — Core Commerce

| Feature | Status | Priority | Description | Dependencies |
| --- | --- | --- | --- | --- |
| Variant stock editing | Planned | P1 | Add audited RESTOCK/ADMIN_ADJUSTMENT operations | Inventory service |
| Product image reorder | Planned | P1 | Allow explicit sort order without URL entry | ProductImage UI/service |
| Bulk catalog import/export | Planned | P2 | Validated operational catalog tools | Category/variant schema rules |
| Checkout error recovery | Planned | P1 | Improve recoverable payment/session messaging and monitoring | Razorpay observability |

## Phase 3 — Customer Experience

| Feature | Status | Priority | Description | Dependencies |
| --- | --- | --- | --- | --- |
| Review submission/display | Partial | P1 | Finish the existing Review foundation | Moderation/product UI |
| Order notifications | Planned | P2 | Notify on confirmation, shipment, and delivery | Provider and consent choice |
| Wishlist/account polish | Planned | P2 | Improve signed-in synchronization and account UX | Customer UX review |
| Search/filter improvements | Planned | P2 | Extend verified catalog discovery | Search data strategy |

## Phase 4 — Operations

| Feature | Status | Priority | Description | Dependencies |
| --- | --- | --- | --- | --- |
| Admin refund UI | Partial | P1 | Wire refund service with permission and idempotency checks | Razorpay refund policy |
| Tracking exception workflow | Planned | P1 | Highlight stale/failed shipments and retry safely | AfterShip behavior |
| Reporting | Planned | P2 | Add verified operational metrics and exports | Metric definitions |
| Historical image migration | Planned | P2 | Decide whether and how to copy legacy Cloudinary records into local storage | Explicit migration and retention policy |

## Phase 5 — Growth

| Feature | Status | Priority | Description | Dependencies |
| --- | --- | --- | --- | --- |
| Coupons/promotions | Planned | P2 | Add explicit pricing rules and checkout verification | Coupon service completion |
| Analytics | Planned | P2 | Define privacy-aware commerce events and dashboards | Consent/metric design |
| Newsletter improvements | Planned | P2 | Add compliant audience workflows beyond read-only visibility | Email provider choice |
| Abandoned-cart work | Inferred | P3 | Consider only after consent, identity, and analytics requirements are defined | Notifications and analytics |

## Current known issues

- COD can oversell because stock is validated but not decremented atomically on order creation.
- Product edit recreates variants and can affect referenced order variants or movement history.
- Historical Cloudinary records are readable but are not managed by the new local lifecycle.
- Rate limiting is local to one application process.
- Review and refund workflows are unfinished.
- New-admin inventory is read-only.
- No automated test suite was found.
