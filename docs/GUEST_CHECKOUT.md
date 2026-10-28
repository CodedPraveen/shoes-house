git# Guest Checkout and Private Order Access

## Status

**Planned — not implemented in the current `main` branch.**

This document records the approved customer-facing direction. It is not evidence that guest checkout, private order links, or email delivery are already available.

## Product decision

1. Customers do not need to register or sign in to buy.
2. Customer login, signup, customer OTP login, and customer profile UI are removed from the intended storefront experience.
3. Checkout supports both existing purchase modes: cart checkout and Buy Now.
4. Customers provide the contact and shipping information required to fulfill the order.
5. Customers receive a private order link by transactional email.
6. The private link grants access to that order without OTP. An order number or database ID alone never grants access.
7. Clerk remains in place for administrator authentication and authorization.
8. Resend is the selected initial transactional email provider; integration and sender-domain verification remain pending.

## Existing implementation constraints

The current schema has required `userId` relations on `Order` and `CheckoutSession`. Existing checkout actions and services resolve a Clerk-backed database user. Order detail and invoice endpoints authorize an authenticated owner or administrator. These are current-state facts and must not be documented as already converted.

The current `Cart` and `Wishlist` are also user-linked in the Prisma schema. Guest cart behavior must be assessed separately: a browser-local cart may already exist in the UI, but persistence and checkout must be verified in source before claiming it is fully guest-safe.

## Target checkout flow

```text
Guest storefront
  → cart or Buy Now
  → collect contact + shipping details
  → validate products, variants, price, stock and address
  → create guest CheckoutSession
  → create Razorpay order
  → customer completes payment
  → verify signature/payment and amount on server
  → idempotent fulfillment transaction
  → create Order + OrderItems + Payment
  → apply existing paid-inventory rules
  → complete CheckoutSession
  → create private order-access token
  → send order confirmation email with private link
```

Razorpay browser success must never be treated as final payment proof. Preserve the existing webhook and server-side verification/idempotency rules.

## Private order-link design requirements

- Generate a cryptographically secure, high-entropy random token (at least 256 bits).
- Store only a one-way hash/digest of the token in the database; do not store the raw token.
- Put the raw token only in the emailed HTTPS URL. Do not log it, expose it in analytics, or return it from unrelated APIs.
- The route must validate the token using a constant-time comparison where applicable and resolve only the associated order.
- The order ID may appear in a URL for routing, but it must not authorize access without the matching token.
- Use HTTPS in production and a restrictive referrer policy so the token is not leaked to third-party origins.
- Avoid caching private order responses in shared caches. Set appropriate private/no-store response headers.
- Support token expiry and revocation/rotation. Define the expiry policy before implementation; do not invent an indefinite token lifetime.
- Rate-limit token attempts and avoid revealing whether an order ID or token exists.
- Administrator order access continues to use Clerk administrator authorization and must not depend on the customer token.

The exact token table/model, token rotation policy, and route shape must be finalized against the current service and routing structure before coding.

## Database migration direction

The implementation will likely need to make `Order.userId` and `CheckoutSession.userId` nullable while adding guest contact and private-access-token data. This is a design direction, not a ready-to-run migration.

Before changing the schema:

1. Inspect all `userId` reads, writes, indexes, relations, exports, reports, and admin queries.
2. Preserve historical customer-linked orders.
3. Add guest fields and token-hash storage in an additive migration.
4. Ensure guest sessions and orders can be created without fabricating Clerk users.
5. Backfill or retain existing user relations without deleting customer history.
6. Test migration against a copy of production-shaped data.
7. Never reset or truncate the production database to introduce guest checkout.

Do not make unrelated `User`, `Cart`, `Wishlist`, `Address`, `Review`, or mobile identity schema changes unless a verified dependency requires them.

## Email integration

Resend is selected but not integrated. The implementation should send email from a server-only service after the order is safely persisted. Email failure must not undo a successfully verified payment or corrupt fulfillment state. Define retry/idempotency behavior and a durable delivery status before production rollout.

Expected configuration names (confirm exact names against the implementation before adding them to `.env.example`):

```env
RESEND_API_KEY=
EMAIL_FROM=
```

Keep these server-only. Verify the sending domain and sender identity before production email is enabled.

## Acceptance checklist

- [ ] A logged-out customer can browse and add items to a cart.
- [ ] A guest can complete CART checkout.
- [ ] A guest can complete BUY_NOW checkout without modifying the existing cart.
- [ ] Guest details are validated server-side and snapshotted on the order.
- [ ] Payment signature, captured state, amount, ownership/session linkage, and idempotency are verified server-side.
- [ ] Duplicate browser requests and duplicate webhooks do not create duplicate orders or decrement stock twice.
- [ ] A successful order gets a high-entropy private access token; only its hash is stored.
- [ ] The customer can open the private link without login or OTP.
- [ ] An order ID without a valid token cannot reveal order details or invoice data.
- [ ] Expired/revoked tokens are rejected safely.
- [ ] Customer profile/login/signup links and guards are removed from storefront navigation and routes.
- [ ] Clerk admin login, `/admin`, `/new-admin`, admin actions, and admin APIs continue to work.
- [ ] Existing customer-linked orders remain accessible to administrators.
- [ ] Resend delivery, retries, and failure handling are tested.
- [ ] Database migration, rollback plan, and production backup are reviewed.
