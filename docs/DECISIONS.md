# Architectural Decisions

## ADR-001: Slug-based product URLs

Use `/product/[slug]` rather than numeric product IDs for readable, stable customer URLs.

## ADR-002: Separate checkout modes

`CheckoutSessionMode` distinguishes `CART` and `BUY_NOW`. Buy Now must not add to or clear the existing cart.

## ADR-003: Razorpay verification is authoritative

Browser payment success alone is not trusted. The server verifies signature, captured status, amount, ownership, and idempotency. Razorpay webhooks share the fulfillment path.

## ADR-004: Immutable order snapshots

Order items and shipping fields copy checkout-time data so later product or address changes do not rewrite invoices or history.

## ADR-005: Atomic paid inventory decrement

Paid fulfillment uses `updateMany` with `stock >= quantity`, checks the affected count, and writes `InventoryMovement`. Application locks improve coordination but do not replace the database predicate.

## ADR-006: Service-oriented business logic

Actions and route handlers own trust boundaries. Services own reusable business logic and Prisma work. UI components should not duplicate either.

## ADR-007: Shared persistent image implementation

Both administrator systems use the same validated staging service and existing BullMQ queue. The worker alone performs Sharp conversion and writes relative-path-addressed WebP files to the shared persistent filesystem. Historical Cloudinary URLs are a read-only compatibility path.

## ADR-008: Separate administrator interfaces

`/admin` remains the established system. `/new-admin` is the newer operations system. Work on one must not casually redesign or reroute the other.

## ADR-009: Close-to-resource new-admin guards

The new-admin layout and every child page authorize before sensitive reads. This accounts for parallel App Router rendering. Server Actions and route handlers authorize independently.

## ADR-010: Hide new-admin from non-admin identities

Logged-out users go to Clerk sign-in with a safe destination. Authenticated non-admin users receive `notFound()` rather than a storefront redirect.

## ADR-011: Soft deletion

Models with `deletedAt` should normally be filtered rather than physically removed. Order snapshots and audit history require particular care.

## ADR-012: Cache catalog, not live customer state

Catalog/search reads use explicit caching and mutation invalidation. Carts, sessions, orders, and operational state require fresh ownership-aware reads.

## ADR-013: Source code outranks documentation

Documentation accelerates discovery but is not an excuse to skip implementation inspection. Update docs when verified code changes make them stale.
