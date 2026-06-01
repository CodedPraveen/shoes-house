# AERÉ Architecture

## Stack

Supabase PostgreSQL · Prisma 6 · Clerk · Cloudinary (ready) · Razorpay (ready) · Vercel

## Product URLs

**Slug-based:** `/product/aero-one`

## Schema highlights

- **ProductVariant** — SKU per color + size, stock per variant
- **Soft delete** — `deletedAt` on Product, Category, User, Order, CartItem, etc.
- **OrderStatus** enum — `PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED`
- **featuredCollection** — static in `data/products.js` (homepage editorial only)

## Data flow

```
Prisma (Supabase) → services/* → Server Components / Server Actions → UI (unchanged)
```

## Cart & wishlist

- **Signed in:** Supabase via `cart-service` / `wishlist-service` + server actions
- **Guest:** localStorage fallback until sign-in

## Clerk

- Webhook: `api/webhooks/clerk/route.js` → `userService.upsertFromClerk`
- Profile page syncs user on load

## Commands

```bash
npm run db:push    # apply schema
npm run db:seed    # catalog + variants
npm run dev
```

## Env

See `.env.local.example` — `DATABASE_URL` (pooler) + `DIRECT_URL` (migrations)
