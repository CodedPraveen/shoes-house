# Shoes House — Scalable Ecommerce 

Frontend-first Next.js App Router structure, ready for MongoDB, Prisma, Stripe, and admin tooling.

## Folder Map
```
app/
  (shop)/          # Storefront routes (navbar + footer)
  (auth)/          # Clerk sign-in / sign-up
components/        # Reusable UI
context/           # Cart + Search (Context API)
hooks/             # useCart, useProductFilters
lib/               # Constants, filters, formatters
data/              # Static catalog (swap for DB)
services/          # Data access layer (DB-ready)
actions/           # Server actions (checkout stubs)
types-ready/       # Schema docs for future TypeScript
```

## Data Flow

1. **Today:** `data/catalog.js` → `services/product-service.js` → pages/components
2. **Later:** Prisma/MongoDB → same service interface → no UI rewrites

## Cart

Client `CartContext` + `localStorage` (`aere-cart-v1`).

```js
{ id, productId, name, image, price, color, size, quantity }
```

Replace with server cart when auth + DB are connected.

## Auth

Clerk protects `/profile`. Middleware in `middleware.js`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/new-arrivals` | Latest products + sort |
| `/trending` | Best sellers, weekly, favorites |
| `/category/[slug]` | shoes, boys, men, footwear |
| `/product/[id]` | PDP with gallery + options |
| `/search` | Full-page live filters |
| `/cart` | Cart management |
| `/profile` | Account (protected) |
| `/sign-in`, `/sign-up` | Clerk auth |

## Setup

1. Copy `.env.local.example` → `.env.local`
2. Add Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com)
3. `npm run dev`