# Shoes House Roadmap

Statuses in this document are planning guidance. Update status only after implementation and verification.

## P0 — Guest-only customer experience

| Work | Status | Notes |
|---|---|---|
| Remove customer login/signup and profile UI | Planned | Keep Clerk and admin login intact |
| Guest CART checkout | Planned | Use browser cart; validate all lines server-side |
| Guest BUY_NOW checkout | Planned | Preserve current cart |
| Guest order persistence | Planned | Preserve historical user-linked orders |
| Private per-order access token | Planned | High entropy; store hash only; no OTP |
| Guest order confirmation page | Planned | Display order confirmation and private link |
| Secure order detail/tracking endpoint | Planned | Token authorizes exactly one order |
| COD inventory correctness | Planned/verify | Atomic stock behavior; avoid duplicate decrement |
| Razorpay guest payment fulfilment | Planned | Signature, amount, idempotency, webhook recovery |

## P1 — Transactional email

| Work | Status | Notes |
|---|---|---|
| Resend integration | Planned | Server-only API key and verified sender |
| Order confirmation email | Planned | Send after order is persisted |
| Shipment/status notification | Planned | Trigger on meaningful state transitions |
| Email retry/observability | Planned | Email failure must not reverse a successful order |

## P1 — Security and testing

- Test private-link token entropy, hashing, expiry/revocation strategy, and leakage controls.
- Test that order ID/order number alone returns no customer data.
- Test cross-order token access denial.
- Test email links, redirects, referrer policy, and query/path token redaction from logs.
- Test guest COD and Razorpay end-to-end.
- Test admin access to guest orders and historical orders.
- Test webhook duplicates and payment recovery.
- Verify migrations against a copy of existing data.

## P2 — Existing product and operations work

- Complete COD inventory accounting if not resolved by guest checkout work.
- Complete review submission/display.
- Complete refund administration workflow.
- Add audited variant stock adjustment.
- Replace per-process rate limiting with a shared strategy.
- Add automated browser E2E coverage.
- Decide whether to migrate historical Cloudinary assets.
