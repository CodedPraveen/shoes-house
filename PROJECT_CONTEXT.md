# Shoes House — Project Context

## Purpose

Shoes House is a Next.js e-commerce application for shoes and jewellery with storefront, checkout, payment, fulfilment, tracking, and admin operations.

## Stack

- Next.js 16 App Router, React 19, JavaScript, Tailwind CSS 4
- Prisma 6 with PostgreSQL/Supabase
- Clerk for administrator authentication only
- Razorpay for online payments
- AfterShip for shipment tracking
- Persistent image filesystem + BullMQ + Redis + Sharp
- Resend selected for initial transactional email integration (pending implementation)
- Google Maps Platform for location assistance

## Customer model — approved target

- No customer login or signup.
- No customer profile UI.
- No customer OTP or password.
- Guest cart in browser storage.
- Guest checkout for CART and BUY_NOW.
- Customer views an individual order through a private, unguessable order link.
- The private link grants access only to its associated order. No OTP is required.
- Email confirmation and order-status messages use Resend after integration is implemented.

## Administrator model

Clerk remains enabled for administrator login. Existing `/admin` and `/new-admin` authorization must continue to work.

## Important architecture rules

- Never trust client-submitted price, stock, user ID, role, order status, or payment state.
- Validate product/variant/quantity and recalculate totals on the server.
- Verify Razorpay payments server-side and preserve idempotent fulfilment.
- Private order tokens must be high entropy; persist only a cryptographic hash.
- Do not expose order data by order number or ID alone.
- Preserve historical orders and admin reporting during schema migration.
- Use additive, reviewed migrations; never reset production data.

## Documentation

See `docs/README.md` for the documentation index and status conventions.
