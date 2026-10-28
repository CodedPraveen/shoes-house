# Patch plan — existing repository files

Ordered by implementation impact. The list is scoped to customer guest checkout, customer login removal, private guest order access, and Resend order-confirmation email.

| Priority | Existing file | Change required | Impact |
|---:|---|---|---|
| 1 | `prisma/schema.prisma` | Make `Order.userId` and `CheckoutSession.userId` nullable; add guest email/contact snapshot, guest access-token hash/expiry/revocation and email delivery state/outbox relation. Keep existing User relations optional. | Very high |
| 2 | `services/checkout-service.js` | Add guest CART line-item creation from a server-validated payload. Current CART implementation reads a database cart by user ID; this cannot be reused for localStorage guest carts. Reuse the existing server product/variant/stock/lock/price helpers. Make session/order creation accept a nullable user and guest contact snapshot. | Very high |
| 3 | `services/checkout-flow-service.js` | Remove unconditional `requireDbUser()` for customer checkout only. Validate guest name/email/phone/address, support CART and BUY_NOW, and keep saved-address features available only to authenticated customers. Verify guest payments against their checkout session rather than a logged-in user. | Very high |
| 4 | `services/order-fulfillment-service.js` | Permit null-user guest sessions; create orders with guest snapshot; retain amount checks, captured-payment verification, locks, idempotency, stock decrement, purchase counts and transaction boundaries. Return/issue guest access credentials safely. | Very high |
| 5 | `services/payment/webhook-service.js` | Ensure webhook-captured guest payments can fulfil the session. Avoid relying on a User relation for a guest session. Schedule email delivery/outbox after committed fulfilment. | High |
| 6 | `components/checkout-client.js` | Guest form for name, email, phone and address. For guest cart, send line items from cart context to the server, but server must verify each product and variant and calculate totals. | High |
| 7 | `components/checkout-buy-now-client.js` | Remove customer account assumptions; submit the selected product/size/quantity and guest contact data. Verify session totals from server response. | High |
| 8 | `app/(shop)/checkout/page.js` | Remove the `AuthGate` wrapper. | Low |
| 9 | `app/api/checkout/session/route.js` | Accept guest payload while retaining CSRF/origin checks, payload size limits and server validation. | Medium |
| 10 | `app/api/checkout/buy-now/session/route.js` | Same for guest BUY_NOW. | Medium |
| 11 | `app/api/checkout/razorpay/verify/route.js` | Allow guest verification; link verification to Razorpay order/session and signature, not user ID supplied by client. | High |
| 12 | `app/api/orders/[orderId]/route.js` | Preserve current Clerk-owner/admin authorization; add a separate secure token route for guest orders rather than weakening this route. | Medium |
| 13 | `app/api/orders/[orderId]/invoice/route.js` | Preserve existing authenticated/admin policy; add token-based guest invoice download with no-store headers and token validation. | Medium |
| 14 | `app/(shop)/orders/[id]/page.js` | Add a guest order confirmation/details view driven by a tokenized URL, not an order ID alone. | Medium |
| 15 | `app/(shop)/orders/page.js` and `components/orders-client.js` | Decide UX for guests: no account history; provide order lookup instructions and use private links from email. | Medium |
| 16 | `components/auth-nav.js` | Remove customer sign-in/profile link from storefront. Check mobile navigation usages too. | Low |
| 17 | `app/(auth)/sign-in/[[...sign-in]]/page.js`; `app/(auth)/sign-up/[[...sign-up]]/page.js` | Remove customer-facing pages or redirect them safely. Keep admin login entry point/redirect working. | Low |
| 18 | `actions/cart-actions.js`; `context/cart-context.js` | Keep current local guest cart. Prevent checkout from requiring account; optionally clear local cart only after successful order. | Medium |
| 19 | `services/email/*` (new) and email outbox worker (new) | Send order-confirmation email after commit, retry safely, record delivery state. | High |
| 20 | `package.json`, `.env.example` | Add `resend` dependency and server-only Resend/sender settings. Do not expose API key with `NEXT_PUBLIC_`. | Low |

## Existing files deliberately not to remove

- `lib/admin-auth.js`
- `middleware.js` unless route behavior requires a narrowly-scoped public-route adjustment
- `api/webhooks/clerk/route.js` until identity sync deprecation is separately reviewed
- `services/payment/razorpay-service.js`
- `services/payment/payment-idempotency.js`
- `/app/(admin)/admin/**` and `/app/(admin)/new-admin/**`

Customer sign-in removal is not a reason to disable Clerk globally. Both admin surfaces currently depend on it.
