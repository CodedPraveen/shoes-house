# Application Architecture

## Layered flow

```text
Customer browser (guest)
  → Next.js App Router
  → guest cart / checkout / private order access
  → services/*
  → Prisma
  → PostgreSQL

Administrator browser
  → Clerk session
  → admin page/action/API guards
  → services/*
  → Prisma
```

External systems: Razorpay (payments), AfterShip (tracking), Resend (planned transactional email), Google Maps (address assistance), Redis/BullMQ/Sharp (image processing).

## Responsibilities

- Client Components: interaction state only; never trusted for price, stock, role, or access.
- Server Components: page data and server rendering.
- Server Actions: validate and authorize each mutation.
- Route handlers: HTTP boundaries, webhooks, public private-token access, invoice responses and admin APIs.
- Services: checkout, fulfilment, order, inventory, email, tracking and catalog business logic.
- Prisma/PostgreSQL: persistence, unique constraints, snapshots, idempotency and audit history.
- Worker: long-running image conversion/finalization.

## Authentication boundaries

- Customers do not authenticate.
- Admins authenticate with Clerk.
- Admin role checks remain server-side.
- Guest order access uses a private per-order token; no OTP.
- A token authorizes one order only and is stored as a hash.

## Checkout rules

CART and BUY_NOW remain distinct. Server-side product, variant, stock, shipping, and total validation is mandatory. Razorpay signature/capture/amount verification and webhook idempotency remain mandatory.

## Image pipeline

Admin upload → validated staging → BullMQ/Redis → Sharp worker → persistent shared volume → relative storage metadata. Legacy Cloudinary URLs remain read-compatible only.

See `AUTH.md`, `FLOWS.md`, `DATABASE.md`, and `SECURITY.md`.
