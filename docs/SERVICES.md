# Services

Search for existing implementations before creating new services. The list below describes current responsibilities and target additions.

## Catalog and products

- `product-service.js`: storefront reads.
- `product-admin-service.js`: administrator product CRUD, image reconciliation and variants.
- `category-service.js`: category reads.
- `inventory-service.js`: stock mutation primitives and audit records.
- `inventory-read-service.js`: inventory read models.

## Checkout, payment and fulfilment

- `checkout-service.js`: CART/BUY_NOW line building, stock validation, checkout sessions, Razorpay setup and COD order creation.
- `checkout-flow-service.js`: current orchestration; currently user-bound and must be adapted for guest checkout.
- `order-fulfillment-service.js`: paid order fulfilment, idempotency, payment records and inventory updates.
- `services/payment/razorpay-service.js`: Razorpay client/signature verification.
- `services/payment/payment-idempotency.js`: duplicate-payment handling.
- `services/payment/webhook-service.js`: webhook processing.
- `refund-service.js`: refund foundation.

## Orders and operations

- `order-service.js`: order reads, tracking attachment and synchronization.
- `order-workflow-service.js`: conditional status transitions and audit history.
- `invoice-service.js`: invoice data and HTML generation.
- `tracking-service.js`: AfterShip requests.
- `new-admin-service.js`: admin dashboards, order/product/customer read models and exports.
- `storefront-service.js`: storefront CMS read models.

## Customer state

Cart persistence is being moved to the guest browser flow for the approved storefront. Existing user-scoped cart/address/wishlist services may remain for admin/history/other integrations only if still needed; remove dead paths after call-site audit.

## Target additions

- Guest order access service: token generation, hash persistence, validation, rotation/revocation.
- Guest checkout service or extension: server-side cart/product/variant validation and order creation.
- Email service: Resend client, templates, and retry-safe send orchestration.

Do not send email from the database transaction. Keep provider failures separate from order/payment persistence.
