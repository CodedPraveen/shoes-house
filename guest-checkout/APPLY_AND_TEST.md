# Apply and test guide

## Before applying

1. Create a feature branch from the latest `main`.
2. Update your local checkout (`git fetch origin && git checkout -b feat/guest-checkout-resend origin/main`).
3. Compare this package with the current source. Do not copy over existing large services wholesale.
4. Merge the Prisma fragment into `prisma/schema.prisma`; do not replace the full schema with the fragment.
5. Review migration SQL against the actual existing constraint/index names and generate a Prisma migration from the final schema.

## Environment

Add `.env.additions.example` values to your environment manager. Verify the sender domain in Resend before enabling email delivery. Never commit actual API keys.

## Required implementation details

### Guest CART

The browser cart is stored in localStorage. Send only identifiers/size/quantity and a bounded list to the server. The server must re-load products and active variants, validate quantity and stock, select the correct variant, calculate prices/shipping and create the session. Do not accept browser subtotal/total/price as authoritative. For concurrent stock safety, reuse product locks and transactional decrement logic already in the repository.

### Guest BUY_NOW

Use the same validated shipping/contact schema and the existing BUY_NOW path. It must not read or mutate the customer's CART.

### Razorpay

Guest browser verification and Razorpay webhooks must converge on the same idempotent `fulfillPaidCheckout` implementation. Verify HMAC signature, fetched Razorpay payment status `captured`, order ID, amount and INR currency. Never fulfill based only on the checkout.js success callback.

### COD

Preserve current `decrementStockForSale` inventory movement and stock changes for every order line. Keep it in the same transaction as order and payment creation. Email dispatch follows the committed transaction.

### Private order access

Generate at least 32 random bytes using `crypto.randomBytes`; return the raw token only once in a HTTPS URL, store only its SHA-256 hash. Apply expiry, revocation, rate limiting, `Cache-Control: no-store`, and avoid token leakage through logs, analytics, referrers or third-party resources. Order ID by itself must not grant access. A dedicated guest route must not expose customer or admin fields beyond the order detail response.

### Resend

Use server-only `RESEND_API_KEY` and a verified `EMAIL_FROM`. Queue a durable email outbox record in the same DB transaction as the order. Process asynchronously with retries and a stable idempotency key. Email provider failure must not roll back payment/order. COD can send an order-received confirmation, with payment method clearly labeled.

## Validation matrix

- Guest CART + Razorpay success.
- Guest CART + Razorpay failed/cancelled/pending.
- Guest BUY_NOW + Razorpay success; confirm existing CART remains unchanged.
- Guest CART + COD; confirm all stock/inventory movements are correct.
- Guest BUY_NOW + COD; confirm stock/inventory movements are correct.
- Duplicate browser verification and duplicate Razorpay webhook.
- Payment amount/currency/order mismatch rejected.
- Expired, revoked, malformed and incorrect guest token rejected.
- Guest order ID without token rejected.
- Guest invoice token access and cache-control verified.
- Resend succeeds, times out, fails, retries, and does not send duplicates.
- Existing signed-in customer's order history and saved-address checkout remain supported if intended.
- `/admin` and `/new-admin` login, permissions and order management remain fully functional.
- Existing product/cart/mobile API behaviors are regression-tested.

## Commands (after integration)

```bash
npm install
npx prisma format
npx prisma validate
npx prisma migrate dev --name guest_checkout
npm run lint
npm run build
```

Do not run a production migration until reviewed, backed up, and tested against a production-like database.
