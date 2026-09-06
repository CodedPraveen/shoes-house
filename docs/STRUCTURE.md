# Repository Structure

## Top-level directories

```text
app/          Next.js App Router pages, layouts, route handlers, and webhooks
components/   Storefront, admin, new-admin, documentation, and shared UI
actions/      Server Actions and their authentication/input boundaries
services/     Business logic, Prisma operations, and third-party integrations
lib/          Authorization, validation, cache, mapping, database, and utilities
prisma/       Prisma schema, migrations, and seed
context/      Cart, wishlist, search, and recently viewed client state
hooks/        Shared React hooks
data/         Seed/catalog source data
public/       Static assets
docs/         Repository-level technical documentation
```

## Route groups

| Path | Responsibility |
| --- | --- |
| `app/(shop)/` | Customer storefront and account flows |
| `app/(auth)/` | Clerk sign-in and sign-up pages |
| `app/(admin)/admin/` | Existing admin system; preserve its behavior |
| `app/(admin)/new-admin/` | Newer operations system with independent authorization |
| `app/api/` | Active route handlers and webhooks |
| `app/docs/` | Developer-facing web documentation page |

## Important components

- `components/admin/` contains existing admin UI and the shared staged image uploader.
- `components/new-admin/` contains the newer operations shell, tables, product form, and order actions.
- `components/docs/` renders the searchable `/docs` web page.
- Shared storefront components live directly under `components/` or in collection-specific folders.

## Server boundaries

- `actions/admin-product-actions.js` owns administrator product actions, staged image uploads, queue submission, retries, and cleanup.
- `actions/new-admin-order-actions.js` owns new-admin order mutations.
- Customer mutations live in purpose-specific action files such as cart, checkout, address, wishlist, and review actions.
- `services/*` should contain reusable business logic. UI components must not duplicate Prisma workflows.

## Duplicate route warning

The repository contains older top-level `api/` files as well as active App Router handlers under `app/api/`. Next.js routing uses `app/api/`; inspect call sites before changing or removing older files.
