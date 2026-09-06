# Database

The schema source of truth is `prisma/schema.prisma`. Prisma 6.19.0 connects to PostgreSQL/Supabase.

## Core models

### Identity and customer data

- `User` has unique `clerkId` and `email`, a string `role`, timestamps, soft deletion, and relations to addresses, cart, wishlist, checkout sessions, orders, and reviews.
- `Address` stores reusable Indian shipping addresses. Checkout no longer asks customers to name an address; the compatible `label` field retains its default.
- `NewsletterSubscriber` stores a unique email and soft-deletion state.

### Catalog

- `Category` has a unique slug, `ProductCollection`, optional parent, child categories, sort order, products, and optional local image metadata.
- `Product` has a unique slug, catalog content, prices, flags, aggregate stock, category, collection, images, colors, sizes, variants, and commerce relations.
- `ProductVariant` has a unique SKU and a compound unique constraint on product/color/size. Variant stock is the operational stock source.
- `ProductImage` stores a nullable historical URL or current relative `storagePath`, width, height, optional alt text, `sortOrder`, `isHover`, timestamps, and soft deletion.
- `ProductColor` is unique per product/color key.
- `ProductSize` is unique per product/size.

### Cart and wishlist

- `Cart` is unique per user.
- `CartItem` points to cart, product, and optionally a specific variant.
- `Wishlist` is unique per user/product and supports soft deletion.

### Checkout, orders, and payments

- `CheckoutSession` snapshots totals, mode, shipping information, expiry, Razorpay order, and resulting order.
- `CheckoutSessionItem` snapshots product and variant details for checkout.
- `Order` stores the customer, totals, shipping snapshot, fulfilment state, confirmation state, tracking fields, payments, items, checkpoints, and status history.
- `OrderStatusHistory` records each operational status transition, its previous/new state, a server-derived actor identifier, timestamp, and optional note.
- `MediaAsset` supports a nullable historical URL or current relative storage path plus dimensions; `HeroSlide`, `StorefrontSection`, `StorefrontSectionItem`, and `NavbarItem` provide the lightweight storefront CMS.
- `OrderItem` snapshots name, image, SKU, price, color, size, and quantity so catalog edits do not rewrite order history.
- `Payment` stores Razorpay identifiers, signature, webhook ID, amount, status, method, raw payload, refund time, and soft deletion.

### Inventory and tracking

- `InventoryMovement` records variant quantity changes with `SALE`, `RESTOCK`, `ADMIN_ADJUSTMENT`, or `REFUND` type and optional order ownership.
- `TrackingCheckpoint` records carrier time, location, message, and tag for an order.
- `WebhookEvent` records Razorpay processing outcomes and idempotency identifiers.

### Reviews

- `Review` is unique per user/product. The model exists, but the submission UI is not finished.

## Important enums

```text
ProductCollection: SHOES, JEWELLERY
OrderStatus: PENDING, CONFIRMED, PROCESSING, READY_TO_SEND, SHIPPED, DELIVERED, CANCELLED
PaymentStatus: PENDING, PAID, FAILED, REFUNDED
CheckoutSessionStatus: PENDING, COMPLETED, EXPIRED, FAILED
CheckoutSessionMode: CART, BUY_NOW
InventoryMovementType: SALE, RESTOCK, ADMIN_ADJUSTMENT, REFUND
```

`WebhookLogStatus` includes invalid signature, duplicate event, amount mismatch, out-of-stock, fulfilled, failed, and ignored outcomes.

## Category seed

Parent categories:

- Shoes (`SHOES`)
- Jewellery (`JEWELLERY`)

Seeded shoe children: Footwear, Men, Women, Boys, Sports, Casual.

Seeded jewellery children: Necklaces, Earrings, Rings, Bracelets, Mangalsutra, Bangles, Anklets, Pendants.

## Data rules

- Prefer soft-deletion filters where the model supports `deletedAt`.
- Preserve order and checkout snapshots.
- Use atomic stock mutations and write matching inventory movements.
- Apply schema changes through migrations for production.
- Do not access Prisma directly from Client Components.
