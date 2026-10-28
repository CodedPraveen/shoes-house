# Business Flows

## Product creation and images

```text
Administrator selects local JPG/PNG files
  → authenticated action validates content and writes a staging file
  → product-admin-service stores Product(PROCESSING) and pending staging references
  → existing BullMQ queue
  → worker validates with Sharp and converts to WebP without resizing
  → persistent /data/ecommerce/images/products/{productId}/{imageId}.webp
  → ProductImage(storagePath, width, height, sortOrder)
  → Product(READY) and staged-original cleanup
```

The first image has `sortOrder = 0` and is the primary image. The current mapper treats the second image as the hover image. New-admin does not accept a pasted product-image URL.

On edit, existing image records are retained by default. Explicitly removed records are soft-deleted, retained records keep their IDs, and new local files append after retained images.

Current local metadata maps to `/images/...`; historical HTTPS Cloudinary URLs continue to render. `SafeImage` validates before calling `next/image` and falls back safely if an allowed source fails to load.

## Current cart and Buy Now checkout

```text
CART: active cart lines → CheckoutSession(CART) → payment/order → clear cart
BUY_NOW: selected variant → CheckoutSession(BUY_NOW) → payment/order → preserve cart
```

The current documented checkout is customer-authenticated and loads saved addresses with ownership checks. Manual addresses pass server validation.

## Target guest checkout (planned)

```text
Guest storefront
  → CART or BUY_NOW
  → collect customer contact and shipping details
  → validate cart/variant/price/stock/address on server
  → create guest CheckoutSession
  → create Razorpay order
  → browser payment
  → server signature + captured status + amount verification
  → idempotent fulfillment transaction
  → Order + OrderItems + Payment
  → inventory decrement using existing paid-order rules
  → complete CheckoutSession; clear cart only for CART
  → create private order token; store token hash only
  → send confirmation email with HTTPS private order link
```

This is a target flow, not current production behavior. Preserve the existing separation between CART and BUY_NOW. Do not trust browser-submitted prices, totals, stock, or payment success.

## Razorpay payment

```text
Current authenticated customer
  → server creates CheckoutSession
  → server creates Razorpay order
  → browser opens Razorpay Checkout
  → server verifies signature and captured payment
  → fulfillPaidCheckout
  → ownership and amount checks
  → Prisma transaction
     → Order and OrderItems
     → Payment(PAID)
     → atomic variant decrements
     → SALE InventoryMovements
     → session completion
     → CART clear when applicable
```

The Razorpay webhook is also authoritative and uses the same idempotent fulfillment path. The guest implementation must retain payment signature, amount, captured-state, and idempotency checks while replacing only the customer-identity assumption.

## Cash on Delivery

The operational order sequence is `PENDING -> CONFIRMED -> PROCESSING -> READY_TO_SEND -> SHIPPED -> DELIVERED`, with cancellation only while the order is still cancellable. Each transition uses a conditional database update and records a server-derived actor. COD payment remains a separate pending payment record and is not automatically changed to PAID on delivery.

Known gap: COD creation currently validates but does not atomically decrement stock or write a sale movement.

## Storefront configuration

`/new-admin/storefront` manages ordered product sections, hero slides, and navbar items per collection. Homepage section edits preserve their stored order; new product sections append and only explicit Move Up/Move Down actions rewrite section `sortOrder`. Legacy non-product section rows remain intact but are not selectable or rendered as managed product sections.

## Shipping and tracking

```text
Order
  → administrator supplies India Post tracking number
  → AfterShip tracking resource
  → order tracking fields
  → AfterShip webhook or manual refresh
  → normalized tracking status and checkpoints
  → customer/admin UI
```

## Current order access

Order detail and invoice routes currently:

1. Authenticate the Clerk session.
2. Validate the order ID format.
3. Load the database user and order.
4. Allow only the owning customer or an administrator.
5. Synchronize tracking or generate the invoice only after authorization.

## Target guest order access (planned)

- Customer opens the private HTTPS order link delivered by email.
- Server validates the high-entropy token against its stored hash and resolves only the associated order.
- The order ID alone is insufficient.
- The response is private/no-store and must not leak the token to third parties.
- Administrator access continues through Clerk admin authorization.

See [GUEST_CHECKOUT.md](./GUEST_CHECKOUT.md) for token requirements, migration design, and acceptance tests.
