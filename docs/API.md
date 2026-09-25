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

## Phase 2 mobile customer API (worktree, not yet deployed)

The new `/api/mobile` routes are JSON adapters over the existing product, category, cart, wishlist, address, and order services. Public routes are `GET /products`, `GET /products/[id]`, and `GET /categories`. Product listing supports bounded `page`/`pageSize`, `q`, `category`, size/color/price-range filters, and the service's existing sort values. This currently paginates after `productService.search` loads mapped products; database-level pagination remains a performance follow-up.

Customer routes require a short-lived Clerk session bearer token in `Authorization` and derive the PostMart user on the server. Cookie-only requests are rejected for this mobile surface. The implemented routes are:

| Method | Route | Service / scope |
| --- | --- | --- |
| `GET` | `/api/mobile/profile` | Resolved customer; only ID, name, email returned |
| `GET`, `POST` | `/api/mobile/cart` | `cartService.getCartSummary` / `addItem` |
| `PATCH`, `DELETE` | `/api/mobile/cart/[lineId]` | `cartService.updateQuantity` / `removeItem`, user-scoped line lookup |
| `GET`, `POST` | `/api/mobile/wishlist` | `wishlistService.getByUserId` / `add` |
| `DELETE` | `/api/mobile/wishlist/[productId]` | `wishlistService.remove`, user-scoped |
| `GET`, `POST` | `/api/mobile/addresses` | `addressService.listByUser` / `create` |
| `PATCH`, `DELETE` | `/api/mobile/addresses/[id]` | `addressService.update` / `remove`, owner-scoped |
| `POST` | `/api/mobile/addresses/[id]/default` | `addressService.setDefault`, owner-scoped |
| `GET` | `/api/mobile/orders` | `orderService.getOrdersByUserId`, customer-safe mapped DTO |
| `GET` | `/api/mobile/orders/[id]` | `orderService.getById`, explicit owner check, customer-safe mapped DTO |
| `POST` | `/api/mobile/checkout/session` | Existing `createCartCheckoutSession`, forced Razorpay, owner-scoped saved address |
| `POST` | `/api/mobile/checkout/razorpay/verify` | Existing signature/payment verification and fulfillment service |
| `POST` | `/api/mobile/auth/phone/request` | Phone challenge request; returns 503 until 2Factor adapter is validated |
| `POST` | `/api/mobile/auth/phone/verify` | Challenge verification/session issuance; returns 503 until adapter is validated |
| `POST` | `/api/mobile/auth/phone/logout` | Revoke hashed phone session token |
| `POST` | `/api/mobile/auth/phone/link/request` and `/verify` | Requires Clerk bearer and both-identity proof; returns 503 until adapter is validated |

The handlers reject malformed input, return 401 without a bearer session, and avoid returning raw errors or payment provider payloads. Clerk bearer tokens are authenticated from a cookie-free request, preventing a browser cookie from satisfying mobile authentication. Commerce routes can also resolve a hashed `pm_phone_` session token once a real OTP verification succeeds. Mutations call the existing rate-limit helper. Its in-memory per-instance behavior is not sufficient for production OTP protection; the phone service additionally records per-phone and per-IP challenge windows in PostgreSQL.

The new migration `20260925000000_phone_identity` makes `User.clerkId` and `User.email` nullable, adds unique `User.phone`, and adds `PhoneAuthChallenge` and `PhoneSession`. This migration is **not deployed**. The 2Factor adapter is intentionally fail-closed because the account's send/verify contract is not yet confirmed. No live Google, email, phone, payment, webhook, Android, iOS, or end-to-end purchase check has passed for this worktree.

Validation on 2026-09-25: backend lint and `prisma validate` passed. A production build exited 0 and compiled the new routes, but static generation logged connection failures for the configured remote PostgreSQL database; it does not establish database-backed correctness. Do not enable phone login or ship the mobile checkout path on this evidence alone. The checkout and phone DTOs, idempotency, ownership, stock, and webhook behavior still require integration/security tests against a migrated test database.

`userService.upsertFromClerk` no longer links a new Clerk ID to an existing PostMart user based only on matching email. Verified identity linking is still required before phone login can share the customer record.

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
