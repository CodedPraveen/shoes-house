# External Integrations

Only environment variable names are documented. Never copy real values here.

## Clerk

Purpose: authentication, session handling, administrator sign-in/authorization, and existing user lifecycle webhooks. The current application also uses Clerk for customer authentication; removing customer login from the storefront must not remove Clerk because both administrator interfaces depend on it.

Important variables:

- Public: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, Clerk route/redirect variables.
- Server-only: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`.

The webhook uses Svix verification before user synchronization. Review customer-related webhook behavior only after inspecting all mobile and historical-user dependencies.

## Resend — selected, integration pending

Resend is the selected initial provider for transactional order emails. It is not documented as a live integration yet.

Planned uses include sending the order confirmation and private order-access link after an order has been safely persisted. Email failure must not roll back verified payment fulfillment. Implement durable retry/idempotency and delivery-status handling before production rollout.

Expected server-only configuration names (confirm against implementation before adding to `.env.example`):

- `RESEND_API_KEY`
- `EMAIL_FROM`

Verify the sending domain and sender identity. Never expose the API key through `NEXT_PUBLIC_*`, client code, logs, or API responses.

## Image storage

New product and hero-banner images are not sent to an external image provider. Next.js stages validated JPG/PNG files, Redis/BullMQ delivers jobs to the existing worker, and Sharp writes WebP files under `IMAGE_STORAGE_ROOT`. Next.js and the worker must mount the same persistent path. See [IMAGE_STORAGE.md](./IMAGE_STORAGE.md).

Historical Cloudinary URLs remain supported when reading existing database records; Cloudinary is not part of the active upload or finalization path.

## Razorpay

Purpose: online payment orders, browser checkout, server verification, and payment webhooks.

Variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

The server verifies browser payment signatures, fetches payment status, matches amounts, enforces checkout/session linkage, and processes webhooks idempotently. Guest checkout must preserve these controls and must not trust browser-submitted totals.

## AfterShip

Purpose: India Post tracking creation, refresh, and webhook updates.

Variables:

- `AFTERSHIP_API_KEY`
- `AFTERSHIP_WEBHOOK_SECRET`

The webhook verifies `as-signature-hmac-sha256` before modifying order tracking state.

## Supabase PostgreSQL

Purpose: persistent relational database accessed through Prisma.

Variables:

- `DATABASE_URL` — pooled application connection.
- `DIRECT_URL` — direct connection used for schema/migration operations.

## Redis

Purpose: BullMQ image jobs, checkout locks, and cache helpers.

Variable: `REDIS_URL`.

Rate limiting is currently in-memory and is not automatically made multi-instance by Redis being present. Guest order-token endpoints and email retries need appropriate shared/durable controls before production.

## Google Maps Platform

Purpose: customer address/location assistance and server geocoding.

- Public/referrer-restricted: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.
- Server-only: `GOOGLE_GEOCODING_API_KEY`, `GOOGLE_GEOLOCATION_API_KEY`.

## Hosting instrumentation

The repository includes Vercel Analytics and Speed Insights packages. The production application topology documented here is Docker Compose with separate Next.js, worker, and Redis services.
