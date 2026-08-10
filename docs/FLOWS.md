# Business Flows

## Product creation and images

```text
Administrator selects local JPG/PNG/WEBP files
  → imageFiles in the new-admin form
  → uploadNewAdminProductImageAction
  → shared imageUploadService
  → Cloudinary folder from CLOUDINARY_UPLOAD_FOLDER
  → secure URLs in original selection order
  → createProductAction
  → product-admin-service
  → Product + ProductImage + colors + sizes + variants
  → RESTOCK inventory movements for positive initial stock
```

The first image has `sortOrder = 0` and is the primary image. The current mapper treats the second image as the hover image. New-admin does not accept a pasted product-image URL.

On edit, existing image URLs are retained by default. Explicitly removed records are soft-deleted, retained records keep their IDs, and new local files append after retained images.

## Cart and Buy Now

```text
CART: active cart lines → CheckoutSession(CART) → payment/order → clear cart
BUY_NOW: selected variant → CheckoutSession(BUY_NOW) → payment/order → preserve cart
```

Saved addresses are loaded with ownership checks. Manual addresses pass server validation.

## Razorpay payment

```text
Authenticated customer
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

The Razorpay webhook is also authoritative and uses the same idempotent fulfillment path.

## Cash on Delivery

```text
Authenticated customer
  → validate product/cart stock
  → create Order(PENDING)
  → create Payment(PENDING, Cash on Delivery)
  → new-admin confirms by call
  → PROCESSING
  → tracking added
  → SHIPPED
  → AfterShip reports delivery
  → DELIVERED and COD revenue realized
```

Known gap: COD creation currently validates but does not atomically decrement stock or write a sale movement.

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

Order detail and invoice routes:

1. Authenticate the Clerk session.
2. Validate the order ID format.
3. Load the database user and order.
4. Allow only the owning customer or an administrator.
5. Synchronize tracking or generate the invoice only after authorization.
