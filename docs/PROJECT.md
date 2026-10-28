# Project Overview

## Purpose

Shoes House is a JavaScript e-commerce application for shoes and jewellery. It provides a customer storefront, guest checkout, payment processing, order fulfilment, shipment tracking, and administrator operations.

## Customer experience — approved target

- Browse shoes and jewellery, search/filter products, and view variants.
- Add products to a browser-persisted guest cart.
- Checkout from cart or Buy Now without an account.
- Pay with Razorpay or use COD where enabled.
- View a specific order using its private order-access link.
- Receive order and shipment emails through Resend after the integration is implemented.

There is no customer login, signup, profile UI, password, customer OTP, or account-based order history in the target experience.

## Administrator capabilities

- Existing `/admin` and `/new-admin` systems.
- Product/category/variant management.
- Inventory and order operations.
- COD call confirmation where enabled.
- India Post tracking via AfterShip.
- Storefront sections, hero slides, and navigation management.

Clerk remains for administrator authentication.

## Technology

| Area | Technology |
|---|---|
| Web | Next.js 16.2.6 App Router, React 19.2.4 |
| Language/UI | JavaScript, Tailwind CSS 4, Framer Motion |
| Authentication | Clerk 7.4.2 for administrators |
| Data | Prisma 6.19.0, PostgreSQL/Supabase |
| Images | Sharp, BullMQ, persistent filesystem |
| Payments | Razorpay |
| Tracking | AfterShip |
| Queue/cache/locking | Redis, BullMQ, ioredis |
| Email | Resend selected; implementation pending |
| Maps | Google Maps Platform |

Versions must be rechecked against `package.json` before upgrades or release documentation.

## Main commands

```bash
npm install
npm run setup
npm run dev
npm run lint
npm run build
```

Use migrations for production schema changes. See `DEPLOYMENT.md`.
