# Repository Structure

## Main directories

```text
app/          Next.js App Router pages, layouts, route handlers and webhooks
actions/      Server Actions and input/auth boundaries
components/   Storefront, admin, new-admin and shared UI
services/     Business logic, Prisma operations and integrations
lib/          Auth guards, validation, cache, database and utilities
prisma/       Schema, migrations and seed
context/      Client cart, wishlist, search and recently viewed state
hooks/        Shared React hooks
workers/      Background image processing
queues/       BullMQ queue definitions
public/       Static assets
docs/         Technical documentation
```

## Route groups

| Path | Responsibility |
|---|---|
| `app/(shop)/` | Public storefront and guest shopping |
| `app/(auth)/` | Existing Clerk auth pages; customer-facing use should be removed/redirected as part of guest-only work while preserving admin access |
| `app/(admin)/admin/` | Existing admin system |
| `app/(admin)/new-admin/` | New operations system |
| `app/api/` | APIs and webhooks |
| `app/docs/` | Developer-facing docs route |

## Guest-only target routes

The exact route structure must be confirmed during implementation. The customer experience needs:
- Guest checkout routes for CART and BUY_NOW.
- A private order page/route that validates the per-order token.
- Optional public track-order landing page only if it does not imply OTP/account login.

## Server boundaries

- Actions/routes validate input and enforce authorization.
- Services implement reusable business logic.
- Prisma access remains server-side.
- Admin routes and mutations preserve their current guards.

## Duplicate route warning

The repository may contain legacy top-level API files as well as active App Router handlers under `app/api/`. Next.js uses `app/api/`; inspect call sites before changing/removing older files.
