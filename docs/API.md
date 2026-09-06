# APIs and Server Actions

This document focuses on important network and mutation boundaries rather than every helper.

## Route handlers

| Route | Purpose | Authorization |
| --- | --- | --- |
| `GET /api/orders/[orderId]` | Return order detail and synchronize tracking | Authenticated owner or admin |
| `GET /api/orders/[orderId]/invoice` | Render an HTML invoice | Authenticated owner or admin |
| `GET /new-admin/orders/export` | Export filtered orders as CSV | Admin only; 401/403 responses |
| `POST /api/webhooks/clerk` | Synchronize Clerk users and roles | Verified Svix signature |
| `POST /api/webhooks/razorpay` | Process payment events | Verified Razorpay signature |
| `POST /api/webhooks/aftership` | Synchronize carrier state | Verified AfterShip HMAC |
| `GET /api/admin/images/staging/[imageId]` | Preview a staged admin image | Admin only |
| `GET /images/[...path]` | Serve a validated stored WebP path | Public, immutable cache |
| `GET/POST /api/admin/products` | Existing admin product API | Inspect the current handler before use |

## Product actions

`actions/admin-product-actions.js` provides:

- Administrator category reads.
- Product retrieval for edit.
- Product create, update, and soft-delete.
- Shared JPG/PNG staging action with a 10 MB per-file limit.
- BullMQ product-image submission and failed-job retry.
- Explicit staged-upload cleanup.

Every exported sensitive action calls `requireAdmin()`.

## New-admin order actions

The new-admin action boundary now enforces sequential order transitions, rejects stale administrator actions, records the Clerk-derived actor, and keeps COD payment state separate from fulfilment state.

`actions/storefront-admin-actions.js` owns authenticated product-section, hero, navbar, and storefront-media mutations.

`actions/new-admin-order-actions.js` provides:

- COD confirmation by call.
- Cancellation while the order is still cancellable and untracked.
- India Post tracking attachment after state checks.
- Tracking refresh and delivery reconciliation.

Inputs are validated server-side and order updates constrain current state to prevent stale transitions.

## Customer actions

Important action groups include checkout, cart, address, wishlist, orders, reviews, newsletter, search, recommendations, geocoding, and tracking.

Customer-sensitive actions must derive the user through Clerk and the database rather than trusting a submitted `userId`.

## HTTP and error behavior

- Use 401 when there is no authenticated session.
- Use 403 when an authenticated identity lacks permission.
- Use 404/not-found boundaries where hiding an administrator route or unavailable resource is appropriate.
- Validate route identifiers before resource operations.
- Do not return third-party secrets or raw private records.
