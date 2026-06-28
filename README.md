# Shoes House — Scalable Ecommerce 

Next.js storefront + admin with Supabase, Prisma, Clerk, Razorpay, and Cloudinary.

## Quick start

```bash
cp .env.local.example .env.local   # fill in keys
npm install
npx prisma generate
npm run db:push
npm run db:seed
npm run dev
```

## Documentation

| File | Purpose |
|------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Stack, folders, flows — start here for AI/human onboarding |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Mermaid diagrams, tables, webhooks |
| [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) | Measured bottlenecks + fixes |
| [ROADMAP.md](./ROADMAP.md) | Phase plan |
| [DECISIONS.md](./DECISIONS.md) | Architecture decision records |

## Key routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Catalog |
| `/product/[slug]` | Product detail + recommendations |
| `/cart` | Cart |
| `/checkout` | Cart checkout (Razorpay) |
| `/checkout/buy-now` | Single-item checkout (isolated from cart) |
| `/orders` | Order history |
| `/admin` | Admin dashboard |

## Performance debugging

```bash
PERF_LOG=1 npm run dev
```

Watch terminal for `[perf] cart.add`, `[perf] checkout.create.*`, etc.

## Apply schema changes

```bash
npm run db:push
```

After pulling performance updates, run `db:push` for `CheckoutSession.mode` enum.

## Stack

Next.js · Supabase PostgreSQL · Prisma · Clerk · Razorpay · Cloudinary · Vercel
