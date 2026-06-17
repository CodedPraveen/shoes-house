# Shoes House — Architecture Decisions

## ADR-001: Slug-based product URLs

**Decision:** `/product/[slug]` not numeric ID.  
**Reason:** SEO, readable URLs, stable links after DB migration.

## ADR-002: No inventory reservation before payment

**Decision:** Stock decrements only after Razorpay webhook `payment.captured`.  
**Reason:** Abandoned carts must not lock inventory.

## ADR-003: Webhook as payment authority

**Decision:** Frontend Razorpay success is not authoritative.  
**Reason:** Prevent tampering; idempotent fulfillment via webhook.

## ADR-004: Separate CheckoutSession modes

**Decision:** `CheckoutSessionMode`: `CART` | `BUY_NOW`.  
**Reason:** Buy Now must not add to cart or checkout entire cart.

## ADR-005: Order snapshots

**Decision:** Copy product name, SKU, price, image onto `OrderItem`; shipping onto `Order`.  
**Reason:** Historical orders/invoices must not change when catalog updates.

## ADR-006: Optimistic cart updates

**Decision:** Client updates cart state immediately; server reconciles.  
**Reason:** Sub-500ms perceived latency; no `revalidatePath` on cart.

## ADR-007: Caching

| Resource | Mechanism | TTL | Invalidate |
|----------|-----------|-----|------------|
| Product by slug | `unstable_cache` | 120s | `revalidateTag('products')` |
| Search catalog | `unstable_cache` | 300s | `revalidateTag('search-catalog')` |
| Cart | None | — | Real-time |
| User session | Clerk | — | — |

**Decision:** Remove catalog from shop layout; lazy-load search catalog.  
**Reason:** Layout was loading full catalog on every navigation (major TTFB regression).

## ADR-008: Slim cart queries

**Decision:** `lib/cart-include.js` — select only fields needed for cart UI.  
**Reason:** Full `productInclude` on cart caused multi-second queries.

## ADR-009: Rate limiting

**Decision:** In-memory sliding window per IP (`lib/rate-limit.js`).  
**Reason:** Simple for single-region; upgrade to Redis for multi-instance.

## ADR-010: Clerk webhook verification

**Decision:** Svix signature verification with `CLERK_WEBHOOK_SECRET`.  
**Reason:** Prevent forged user sync events.

## ADR-011: InventoryMovement audit trail

**Decision:** Every stock change writes `InventoryMovement`.  
**Reason:** Debugging, ERP readiness, oversell investigations.

## ADR-012: Atomic stock decrement

**Decision:** `updateMany` with `stock: { gte: qty }`; fail if `count !== 1`.  
**Reason:** Race-safe oversell protection at DB level.
