# AERÉ Architecture

## Access Control

**Public:** `/`, `/new-arrivals`, `/trending`, `/products`, `/category/*`, `/product/*`, `/search`, static pages, auth pages.

**Protected (sign-in required):** `/profile`, `/cart`, `/checkout`, `/orders`, `/wishlist`

**Admin only:** `/admin/*` — Clerk user with `publicMetadata.role = "admin"` or email in `ADMIN_EMAILS`

## Folder Structure

```
app/
  (shop)/           Storefront
  (auth)/           Clerk sign-in/up
  (admin)/admin/    Admin dashboard
api/
  admin/products/   Stub
  webhooks/razorpay/ Stub
components/
  admin/            Admin UI
context/            Cart, Search, Wishlist, Recently Viewed
providers/          AppProviders (Clerk + contexts)
hooks/
lib/
services/
  payment/          Razorpay + webhooks (stubs)
  upload/           Image upload abstraction
data/
constants/
utils/
prisma/             Schema ready
database/           Setup docs
types-ready/
actions/
```

## Data Flow

`data/catalog.js` → `services/product-service.js` → UI

Replace catalog with Prisma when `DATABASE_URL` is set.

## Cart / Wishlist

Client Context + localStorage. Protected routes require auth to view; add actions redirect guests to sign-in.

## Payments

`services/payment/razorpay-service.js` + webhook route — not integrated.

## Invoices

`services/invoice-service.js` — PDF generation stub.

## Admin

Mock data in `data/admin-mock.js`. Product/inventory/order/user management UI ready for API + DB.

## Env

See `.env.local.example` — Clerk, `ADMIN_EMAILS`, future `DATABASE_URL`, Razorpay keys.
