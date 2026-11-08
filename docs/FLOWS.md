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

## Cart and Buy Now checkout

```text
CART: active cart lines → CheckoutSession(CART) → payment/order → clear cart
BUY_NOW: selected variant → CheckoutSession(BUY_NOW) → payment/order → preserve cart
```

Guests use browser-local cart state; authenticated historical customers may still use the server cart. A failed Clerk/database identity resolution falls back to the isolated browser cart. Manual addresses pass server validation; saved-address mutations remain authenticated and owner-scoped.

## Guest checkout

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
  → transfer the original private order token hash
  → enqueue Resend email and optional consented WhatsApp independently
```

This is implemented on the branch but not production-verified. CART clears only after successful creation/fulfillment; BUY_NOW preserves the cart. Browser-submitted prices, totals, stock, and payment success are never trusted.

## Razorpay payment

```text
Guest or existing authenticated customer
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

COD creation atomically decrements stock and writes a sale movement in the same order transaction. Cancellation restores stock only when a sale movement exists and no prior restock/refund movement has restored it.

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

## Order access

Guest order detail and invoice access:

- Customer opens the private HTTPS order link delivered by email or consented WhatsApp.
- Server validates the high-entropy token against its stored hash and the requested order.
- The order ID alone is insufficient.
- The response is private/no-store and must not leak the token to third parties.
- Existing owner and administrator access continues through Clerk authorization.

See [GUEST_CHECKOUT.md](./GUEST_CHECKOUT.md) for token requirements, migration design, and acceptance tests.
