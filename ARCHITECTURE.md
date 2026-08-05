# Post Mart Architecture

## System diagram

```mermaid
flowchart TB
  subgraph Client["Next.js App Router (Client)"]
    UI[Shop + Admin UI]
    ClerkUI[Clerk Auth UI]
  end

  subgraph Next["Next.js Server"]
    MW[Middleware / Clerk]
    SC[Server Components]
    SA[Server Actions]
    API[API Routes]
  end

  subgraph External["External Services"]
    Clerk[Clerk Auth]
    RZP[Razorpay Payments]
    CLD[Cloudinary CDN]
  end

  subgraph Data["Data Layer"]
    Prisma[Prisma ORM]
    DB[(Supabase PostgreSQL)]
  end

  UI --> MW
  ClerkUI --> Clerk
  MW --> SC
  MW --> SA
  MW --> API
  SC --> Prisma
  SA --> Prisma
  API --> Prisma
  Prisma --> DB

  Clerk -->|webhooks user.*| API
  RZP -->|webhooks payment.*| API
  SA -->|checkout| RZP
  SA -->|admin uploads| CLD

  Clerk -.->|session| SA
```

## Request flow

```
Browser
  → Clerk (auth session)
  → Server Actions / API Routes
  → services/*
  → Prisma
  → Supabase PostgreSQL
```

Payments: **Razorpay webhook** is authoritative (not frontend success).  
Media: **Cloudinary** for admin product images.

## Core tables (ER overview)

```mermaid
erDiagram
  User ||--o| Cart : has
  User ||--o{ Wishlist : has
  User ||--o{ Address : has
  User ||--o{ Order : places
  User ||--o{ Review : writes
  User ||--o{ CheckoutSession : starts

  Category ||--o{ Product : contains
  Product ||--o{ ProductImage : has
  Product ||--o{ ProductColor : has
  Product ||--o{ ProductSize : has
  Product ||--o{ ProductVariant : has

  ProductVariant ||--o{ InventoryMovement : tracks
  ProductVariant ||--o{ CartItem : in
  ProductVariant ||--o{ OrderItem : sold

  Cart ||--o{ CartItem : contains
  Order ||--o{ OrderItem : contains
  Order ||--o{ Payment : has
  Order ||--o{ InventoryMovement : sale

  CheckoutSession ||--o{ CheckoutSessionItem : has
  CheckoutSession |o--|| Order : becomes
```

## Product URLs

**Slug-based:** `/product/aero-one`

## Production safeguards (verified — do not duplicate)

| System | Location |
|--------|----------|
| InventoryMovement audit | `InventoryMovement` + `inventory-service.js` |
| Atomic oversell protection | `decrementStockForSale` (`updateMany` + `count === 1`) |
| Webhook logging | `WebhookEvent` + `webhook-log-service.js` |
| Refund foundation | `Payment.refundedAt`, `Order.refundReason`, `refund-service.js` |
| Payment verification | Razorpay signature + amount match + idempotency |
| Order snapshots | `OrderItem` + shipping fields on `Order` |

## Admin products (Phase 5)

- Create / edit / soft-delete: `product-admin-service.js` + `admin-product-actions.js`
- Pages: `/admin/products/new`, `/admin/products/[id]/edit`
- Images: Cloudinary (`image-upload-service.js`) + optional upload widget
- New products appear on storefront via `revalidatePath` (products, slug, categories, search)

## Rate limiting

In-memory sliding window per IP (`lib/rate-limit.js`) on checkout, cart, newsletter, admin mutations, geocode, webhooks.

## Commands

```bash
npm run db:push
npm run db:seed
npm run dev
```

## Env

See `.env.local.example` — database, Clerk (`CLERK_WEBHOOK_SECRET`), Razorpay, Cloudinary, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` (widget).

## Manual testing checklist

### Payments
- [ ] Duplicate Razorpay webhook → `DUPLICATE_EVENT` log, no second order
- [ ] Tampered payment amount → `PAYMENT_AMOUNT_MISMATCH`
- [ ] Invalid webhook signature → `INVALID_SIGNATURE` (401)
- [ ] Successful capture → `FULFILLED`, stock reduced once

### Inventory
- [ ] Two users checkout last unit → one `FULFILLED`, one `OUT_OF_STOCK`
- [ ] `InventoryMovement` rows for each sale
- [ ] Stock only changes after webhook (not cart/checkout)

### Cart
- [ ] Guest cart (localStorage)
- [ ] Signed-in cart (database)
- [ ] Sign-in merge behavior

### Addresses
- [ ] Create / edit / delete / default on profile
- [ ] Saved address at checkout
- [ ] Manual entry at checkout
- [ ] “Use my location” fills fields

### Orders
- [ ] Order after webhook
- [ ] Invoice download
- [ ] Order history + statuses

### Admin
- [ ] Create product → visible on `/products` and `/product/[slug]`
- [ ] Edit / soft-delete product
- [ ] Cloudinary image upload
- [ ] Orders dashboard
- [ ] Inventory movement history (Prisma Studio)

### Newsletter
- [ ] Subscribe + rate limit on spam
