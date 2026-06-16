# AERÉ — Project Context

## What this is

Premium sneaker ecommerce (**AERÉ**) built with Next.js 16 App Router, JavaScript, Tailwind CSS.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js App Router, React 19, Tailwind 4, Framer Motion |
| Auth | Clerk (Svix webhooks → User sync) |
| Database | Supabase PostgreSQL |
| ORM | Prisma 6.19 |
| Payments | Razorpay (webhook = source of truth) |
| Media | Cloudinary (admin uploads) |
| Deploy | Vercel |

## Key directories

```
app/(shop)/          Storefront
app/(admin)/admin/   Admin dashboard
app/api/             Webhooks, invoice, admin API
actions/             Server Actions
services/            Business logic (Prisma)
lib/                 Helpers, cache, perf, cart utils
components/          UI (do not redesign without approval)
context/             Cart, wishlist, search, recently viewed
prisma/schema.prisma Database schema
```

## Data flow

```
UI → Server Actions / Server Components → services/* → Prisma → PostgreSQL
```

## Auth model

- **Guest:** cart + wishlist in localStorage
- **Signed-in:** cart + wishlist in DB via server actions
- **Admin:** `ADMIN_EMAILS` or Clerk `publicMetadata.role = admin`

## Checkout architecture

| Flow | Session mode | Clears cart? |
|------|--------------|--------------|
| Cart checkout | `CART` | Yes (after webhook) |
| Buy Now | `BUY_NOW` | No |

Stock is **never** reserved until Razorpay webhook verifies payment.

## Product URLs

Slug-based: `/product/aero-one`

## Commands

```bash
npm run dev
npm run db:push
npm run db:seed
PERF_LOG=1 npm run dev   # performance instrumentation
```

## Env

See `.env.local.example`

## Related docs

- `ARCHITECTURE.md` — diagrams
- `PERFORMANCE_REPORT.md` — measured bottlenecks
- `ROADMAP.md` — phases
- `DECISIONS.md` — ADRs
