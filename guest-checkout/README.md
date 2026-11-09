# Shoes House — Guest Checkout + Resend Implementation Pack

This package is prepared against the public `main` branch of `CodedPraveen/shoes-house` (tree SHA observed during preparation: `8d1a011e525cec507ca697444da57d8d9a72a454`, 2026-10-28).

## Important status

This is a **source-aligned implementation scaffold and change plan**, not a fully integrated, production-ready replacement for the application. The current repository's checkout, payment fulfilment, admin order processing, order history, and email delivery have tightly coupled behaviors. Some source files returned by GitHub were truncated by the connector, and this runtime could not clone the repository. To avoid silently overwriting important business logic, this ZIP deliberately does not include guessed replacements for the large existing checkout and order services.

The included SQL migration and new service/template files are starting points and require integration with the existing full source followed by tests. Do not deploy this ZIP directly to production.

## Confirmed repository facts

- Default branch is `main`.
- `context/cart-context.js` already supports a browser `localStorage` guest cart. Signed-in cart writes use server actions.
- `services/checkout-flow-service.js` currently calls `requireDbUser()` for both checkout modes and payment verification.
- `services/checkout-service.js` creates Razorpay sessions with a required `userId`; COD creates orders, decrements stock via `decrementStockForSale`, and clears the database cart. Guest CART needs a distinct server-trust boundary because the current cart is local-only.
- `services/order-fulfillment-service.js` loads `CheckoutSession.user`, rejects sessions without a `User`, and expects `session.userId`. It is already responsible for payment idempotency, inventory decrement, stock checks and order creation. These behaviors must be preserved.
- `services/payment/webhook-service.js` sends captured payments to the same fulfilment service. Guest payment support must also work through this webhook path, not only browser verification.
- Admin authentication is Clerk-based (`lib/admin-auth.js`); it must remain enabled.
- Customer order details and invoice endpoints currently require Clerk authentication.

## Files in this package

- `PATCH_PLAN.md`: exact existing files to inspect/change and implementation order.
- `prisma/guest-checkout-schema.fragment.prisma`: model additions/changes to merge into the actual Prisma schema; not a drop-in full schema.
- `prisma/migrations/20261028000000_guest_checkout/migration.sql`: draft PostgreSQL migration. Review relation/index names against generated schema before running.
- `new-files/services/guest-order-access-service.js`: token generation/hash/validation primitive.
- `new-files/services/email/resend-client.js`: lazy Resend client initializer.
- `new-files/services/email/order-confirmation-email.js`: server-side order confirmation sender.
- `new-files/emails/order-confirmation.js`: HTML email template builder.
- `new-files/app/api/guest-orders/[token]/route.js`: guest order-detail route scaffold (requires mapping to the full order response shape).
- `.env.additions.example`: environment variables to add; do not replace `.env.example`.
- `APPLY_AND_TEST.md`: safe application instructions and test matrix.

## Non-negotiable safety rules

1. Keep Clerk for `/admin` and `/new-admin`.
2. Never authorize order access using an order ID alone. Store only SHA-256 token hashes; use a high-entropy token, expiry and revocation.
3. Never trust client-calculated totals, prices, stock, variant IDs, or payment status. Re-fetch products/variants and calculate the amount server-side.
4. Keep Razorpay signature verification, captured-payment confirmation, amount/currency matching, payment idempotency and webhook handling.
5. Dispatch confirmation emails only after the order is committed. Email failure must not reverse a successful order or payment. Use a durable outbox/retry mechanism before production.
6. Do not remove Clerk dependencies while admin authentication still uses them.
