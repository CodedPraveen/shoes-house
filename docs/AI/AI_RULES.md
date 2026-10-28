# AI Development Rules

## Before changing code

- Read `docs/README.md`, `PROJECT.md`, `STRUCTURE.md`, and `ARCHITECTURE.md`.
- Read the feature-specific docs.
- Inspect current source, schema, migrations, call sites and tests.
- Distinguish current implementation from approved target behavior.
- Preserve unrelated worktree changes.

## Customer experience

- Customer storefront is guest-only by design.
- Do not add customer login, signup, profile, password, or OTP.
- Do not route checkout/order viewing through Clerk customer auth.
- Use a private per-order token for customer order access; persist only a hash.
- Never expose an order using order ID/number alone.
- Keep Clerk for administrators.

## Admin systems

- Preserve `/admin` and `/new-admin`.
- Protect each page/action/API server-side.
- Do not rely on hidden UI or client-side roles.

## Checkout and payments

- Never trust client price, totals, stock, payment state, role or user ID.
- Validate product/variant/quantity and calculate totals on the server.
- Preserve CART/BUY_NOW isolation.
- Verify Razorpay signature, captured state, amount and session association.
- Preserve idempotency and webhook verification.
- Use transactions and atomic inventory conditions.
- Email failure must not roll back a successful order.

## Database

- Preserve historical orders, payment IDs, inventory history and snapshots.
- Use additive migrations; never reset production data.
- Inspect nullable ownership implications before modifying `User` relations.

## Resend

- Keep API key server-only.
- Do not log private order links.
- Send only after durable order persistence.
- Make notifications retry-safe and separate from checkout transaction.

## Images

- Use validated staging, generated IDs, relative storage paths, BullMQ and Sharp.
- Do not introduce arbitrary external upload URLs or absolute filesystem paths.

## Validation and handoff

- Run focused lint, Prisma validation, build and relevant tests.
- Test guest and admin access boundaries.
- Do not claim live payment, email, database, webhook or deployment verification unless actually performed.
- Update docs only to reflect verified implementation.
