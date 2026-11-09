# Integration gaps before this can be called implemented

The pack intentionally leaves these changes as integration tasks because they require the complete, non-truncated live source and the generated Prisma schema:

1. Make `Order.userId` and `CheckoutSession.userId` nullable in the complete schema; update existing FK delete behavior deliberately.
2. Add `guestEmail`/token fields to `CheckoutSession` and `Order`; add `OrderEmailOutbox` relation on Order.
3. Extend `checkout-service.js` with guest cart line validation and guest order/payment creation. Current browser cart item shape must be checked against `buildSessionLineItems`; do not pass arbitrary prices/product labels.
4. Extend `checkout-flow-service.js` for unauthenticated guest inputs and for guest verification; do not just remove `requireDbUser()` while leaving user-specific assumptions.
5. Extend `order-fulfillment-service.js` to permit sessions with no User and persist guest email + token hash into the order. It must still enforce order-id/amount/currency/captured status, transaction/lock/idempotency, and stock decrement.
6. Update `webhook-service.js` path by using the modified fulfilment service; webhooks are essential if the customer closes the browser after payment.
7. COD service creation must create an outbox record in the same transaction as Order/Payment/inventory update.
8. Add a durable outbox worker/queue. `sendOrderConfirmationEmail()` is the provider adapter, not a complete retry engine.
9. Connect checkout components to guest payloads. Current forms support signed-in customer data and saved address selection; inspect full file and preserve validations/location picker/payment UI.
10. Add guest invoice route or safe token support to the existing invoice route.
11. Adjust customer navigation and sign-in/up pages while verifying middleware + both admin sign-in paths.
12. Validate migration against actual production schema and run integration tests in a staging DB.

The included SQL migration is a draft: validate it against the exact schema deployed to production. Prisma migration names, existing FK names and migration history can differ.
