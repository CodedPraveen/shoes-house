# AERÉ Database Setup (Supabase + Prisma)

## 1. Create Supabase project

In [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → Database:

- Copy **Connection string** (Transaction pooler) → `DATABASE_URL`
- Copy **Direct connection** → `DIRECT_URL`

Add both to `.env.local`.

## 2. Push schema & seed

```bash
npm run db:push
npm run db:seed
```

Or with migrations:

```bash
npm run db:migrate
npm run db:seed
```

## 3. Verify

```bash
npm run db:studio
```

## 4. Product URLs

Products use **slugs** in URLs:

`/product/aero-one`

`featuredCollection` on the homepage stays static in `data/products.js` (not in DB).

## Seed source

`prisma/seed.js` imports one-time data from `data/catalog.js` (not used at runtime on the storefront).
