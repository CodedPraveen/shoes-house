# Application Architecture

## Layered flow

```text
Browser
  → Next.js App Router pages and components
  → Server Components / Server Actions / Route Handlers
  → services/*
  → Prisma
  → Supabase PostgreSQL

External systems: Clerk, Razorpay, AfterShip, Google Maps
Image processing: Next.js staging → Redis/BullMQ → worker/Sharp → shared persistent filesystem
```

## Responsibilities

### Browser and UI

Client Components own interaction state, optimistic UI, file selection, and browser-only integrations. They are not trusted authorization boundaries.

### Server Components

Server Components fetch data for pages. Sensitive new-admin pages call `requireNewAdminPage()` before service or Prisma access because layouts and pages may begin rendering in parallel.

### Server Actions

Server Actions are remotely callable server boundaries. Sensitive actions authenticate and authorize internally before invoking services.

### Route handlers

Route handlers own HTTP response codes, webhook verification, resource authorization, CSV export, invoice output, and tracking APIs.

### Services

Services implement business operations and data access. Examples include product administration, checkout, fulfillment, inventory, orders, tracking, invoices, newsletters, users, and refunds.

### Prisma and PostgreSQL

Prisma models relational state, unique constraints, soft deletion, immutable order snapshots, payment idempotency, and inventory movements. Supabase provides PostgreSQL through `DATABASE_URL` and `DIRECT_URL`.

## Authentication boundaries

- Clerk authenticates customers and administrators.
- Customer resources derive the Clerk identity server-side and resolve the corresponding Prisma user.
- New-admin pages use `requireNewAdminPage()`.
- New-admin APIs and mutations use `requireAdmin()` independently.
- Resource routes such as order and invoice APIs enforce owner-or-admin access.

See [AUTH.md](./AUTH.md) and [SECURITY.md](./SECURITY.md).

## Data mutation principle

Business mutations should follow this direction:

```text
UI → authenticated action/route → service → Prisma transaction → cache invalidation
```

Do not call third-party APIs with secrets from Client Components. Do not process image binaries in the Next.js request process beyond validation and staging.
