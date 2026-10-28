# Shoes House — Architecture Decisions

## ADR-001: Slug-based product URLs
Use `/product/[slug]` for readable and stable product URLs.

## ADR-002: Separate checkout modes
`CheckoutSessionMode` distinguishes `CART` and `BUY_NOW`. Buy Now must not add to or clear the existing cart.

## ADR-003: Razorpay server verification is authoritative
Browser payment success alone is not trusted. Verify signature, captured state, amount, session association, and idempotency. Razorpay webhooks remain an authoritative recovery/fulfilment path.

## ADR-004: Immutable order snapshots
Copy product name, image, SKU, price, variant attributes, and shipping details into order records so later catalog/address changes do not rewrite historical orders.

## ADR-005: Atomic inventory mutation
Use database predicates/transactions for stock changes and write corresponding `InventoryMovement` audit records. COD must not bypass oversell protection.

## ADR-006: Service-oriented business logic
Actions and route handlers own input validation and trust boundaries. Services own reusable business logic and Prisma transactions.

## ADR-007: Persistent image processing
New uploads use validated staging, BullMQ, Sharp, and a shared persistent filesystem. Historical Cloudinary URLs remain readable only.

## ADR-008: Separate administrator interfaces
`/admin` and `/new-admin` remain distinct UI systems. Shared backend changes must preserve both.

## ADR-009: Customer accounts are not part of the storefront
The approved customer experience is guest-only: no customer sign-in, signup, profile, password, or OTP login. Clerk remains for administrators.

## ADR-010: Private order links replace customer order accounts
A customer receives a high-entropy private access link for each order. The token is scoped to one order; only its hash is stored. Order ID/number alone never authorizes access. No OTP is required to view the order.

## ADR-011: Resend is the initial transactional email provider
Use Resend for order confirmation and relevant shipment/status notifications. Keep provider calls server-side and isolate email failure from order/payment success. Resend integration is not considered live until credentials, sender domain, and delivery are verified.

## ADR-012: Additive schema changes
Guest-order support must preserve existing user-linked orders, payments, inventory movements, and admin reporting. Use reviewed migrations; do not reset production data.

## ADR-013: Source code outranks documentation
Inspect source before changing code. Update docs only when implementation status is verified.
