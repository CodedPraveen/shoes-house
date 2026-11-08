# Guest Checkout and Private Order Access

## Phase 1 status

Implemented on `new-guest-checkout`; production readiness is not claimed until the separate Phase 2 test and security review passes.

Customers can complete cart or Buy Now checkout without a customer account using COD or Razorpay. Clerk remains installed for administrators and for the unchanged mobile API contracts.

## Checkout flows

### COD

1. The server validates email, Indian mobile number, shipping data, products, prices, variants, and stock.
2. It creates the order and pending COD payment and atomically decrements stock with `SALE` movements.
3. A 32-byte guest token is generated. Only its SHA-256 hash and expiry are stored on the order.
4. Email and optional WhatsApp outbox records are created independently of order success.
5. The browser clears only a cart checkout and opens `/orders/ORDER_ID?status=confirmed&token=TOKEN`.

Buy Now never reads or clears the existing cart.

### Razorpay

1. The checkout session stores the token hash and an AES-256-GCM encrypted, short-lived notification copy.
2. The raw token is returned to the browser and sent back with payment verification.
3. The server independently verifies the Razorpay signature, captured payment, amount, checkout session, and exact guest token.
4. Idempotent fulfillment transfers the original token hash to the order, writes payment/order/inventory data, and completes the session.
5. Duplicate browser verification returns the same browser-supplied token after validating it. Webhooks fulfill from the stored hash/encrypted notification payload and never require the raw browser token.

## Private order and invoice access

- `GET /api/guest-orders/[token]?orderId=...` validates the token hash, requested order, expiry, and revocation state.
- The customer order page uses that endpoint when a token is present. Missing or invalid tokens do not authorize access.
- `GET /api/orders/[orderId]/invoice?token=...` supports the same guest authorization.
- Existing authenticated-owner and administrator access remains available through the existing order/invoice APIs.
- Private responses use `no-store`, `private`, and `no-referrer` headers.

The default token lifetime is 168 hours. `GUEST_ORDER_TOKEN_TTL_HOURS` may be set from 1 through 720 hours.

## Notifications

The existing `OrderEmailOutbox` is used for Resend. `OrderWhatsAppOutbox` is an independent optional channel. Both are processed through the existing BullMQ worker and a one-minute durable sweep.

- Provider calls happen after order persistence and never control checkout/payment success.
- Unique order and idempotency keys prevent duplicate confirmations.
- Failed email deliveries are retried with bounded exponential delays.
- WhatsApp requires explicit, unchecked consent and a valid normalized Indian E.164 number.
- Missing WhatsApp credentials, invalid numbers, timeouts, and Meta errors never surface to the customer or affect email.
- The encrypted token payload is cleared after delivery or an intentional WhatsApp skip.

Required email configuration:

```env
RESEND_API_KEY=
EMAIL_FROM=
NOTIFICATION_TOKEN_ENCRYPTION_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.example
```

`EMAIL_FROM` must use a sender on a domain verified in Resend. The encryption key must decode to exactly 32 bytes (base64) or be 64 hexadecimal characters.

Optional Meta WhatsApp Cloud API configuration:

```env
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_API_VERSION=
WHATSAPP_ORDER_TEMPLATE_NAME=
WHATSAPP_ORDER_TEMPLATE_LANGUAGE=en
```

The Meta business and sending phone number must be approved, and the configured utility template must accept order number, amount, payment method, and private order URL body parameters in that order.

## Database migrations

- `20261028000000_guest_checkout`: nullable ownership, guest token/email fields, and email outbox.
- `20261028183005_guest_checkout`: safely converts delivery state from text to the Prisma enum without dropping data.
- `20261108000000_guest_notifications`: WhatsApp consent/status/outbox and encrypted notification-token payloads.

## Known limitations pending Phase 2

- Real Resend, Meta, Razorpay, Clerk, Redis, and production-shaped database behavior has not been tested in this phase.
- Token abuse/rate-limit behavior remains per-process and needs multi-instance verification.
- No production migration or deployment has been executed.
