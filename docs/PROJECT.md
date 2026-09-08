# Project Overview

## Purpose

Post Mart is a JavaScript e-commerce application for shoes and jewellery. It provides a customer storefront, checkout and order experience, and two separate operations interfaces: the established `/admin` system and the newer `/new-admin` system.

The repository is production-oriented, but source code alone does not prove the current deployment status.

## Customer capabilities

- Browse shoes and jewellery collections and categories.
- Search, filter, and view product details.
- Select product color and size variants.
- Use guest or signed-in cart and wishlist experiences.
- Save shipping addresses.
- Checkout from the cart or through Buy Now.
- Pay through Razorpay or create Cash on Delivery orders.
- View order history, invoices, shipment status, and tracking checkpoints.

## Operations capabilities

- Maintain products, variants, categories, stock visibility, and product images.
- Review orders, payments, customers, and newsletter subscribers.
- Confirm COD orders by call in the new-admin workflow.
- Attach India Post tracking and synchronize AfterShip status.
- Export filtered new-admin orders as CSV.

## Technology

Versions are taken from `package.json`:

| Area | Technology |
| --- | --- |
| Web | Next.js 16.2.6 App Router, React 19.2.4 |
| Language | JavaScript |
| Styling | Tailwind CSS 4, Framer Motion 12.40.0 |
| Authentication | Clerk 7.4.2, Svix 1.95.1 |
| Data | Prisma 6.19.0, PostgreSQL/Supabase |
| Images | Sharp 0.34.5, BullMQ 6.0.8, persistent filesystem storage |
| Payments | Razorpay 2.9.6 |
| Tracking | AfterShip API through Axios |
| Queue/cache/locking | Redis with BullMQ 6.0.8 and ioredis 5.11.1 |
| Hosting instrumentation | Vercel Analytics and Speed Insights |

## Primary commands

```bash
npm install
npm run setup
npm run dev
npm run lint
npm run build
```

Database commands are documented in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Administrative systems

`/admin` is the existing admin interface. `/new-admin` is the newer operations interface. They share selected backend services, but their route layouts and UI components are separate.

Do not modify `/admin` while working on `/new-admin` unless the task explicitly requires it.
