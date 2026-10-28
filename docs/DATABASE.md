# Database

The schema source of truth is `prisma/schema.prisma`. Prisma 6.19.0 connects to PostgreSQL/Supabase.

## Current core models

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

- `CheckoutSession` currently requires `userId` and snapshots totals, mode, shipping information, expiry, Razorpay order, and resulting order.
- `CheckoutSessionItem` snapshots product and variant details for checkout.
- `Order` currently requires `userId` and stores the customer, totals, shipping snapshot, fulfilment state, confirmation state, tracking fields, payments, items, checkpoints, and status history.
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

## Guest checkout schema impact — planned, not migrated

The current `Order.userId` and `CheckoutSession.userId` fields are required. Guest checkout cannot be implemented safely by changing UI alone.

The likely migration direction is:

- Make `Order.userId` nullable while retaining historical values and the relation for existing customer orders.
- Make `CheckoutSession.userId` nullable while preserving user-linked sessions.
- Store validated guest contact details needed for fulfillment and communication.
- Store only a one-way hash of a high-entropy private order-access token, with expiry/revocation metadata.
- Add indexes and constraints that match actual query and uniqueness requirements.

This is a design outline, not a migration specification. Before implementation, inspect every use of these fields, relation behavior, admin reports, exports, webhook fulfillment, cleanup jobs, and mobile API dependencies. Decide whether token data belongs on `Order` or a separate token model. Do not store raw tokens.

Do not remove `User`, Clerk identity fields, customer history, or unrelated cart/address/wishlist/review relations as part of this change. Do not fabricate Clerk users for guests.

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
- Never reset or truncate production data to introduce guest checkout.
