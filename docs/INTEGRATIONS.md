# External Integrations

Only environment variable names are documented. Never copy real values here.

## Clerk

Purpose: authentication, session handling, sign-in/sign-up UI, and user lifecycle webhooks.

Important variables:

- Public: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, Clerk route/redirect variables.
- Server-only: `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`.

The webhook uses Svix verification before user synchronization.

## Cloudinary

New-admin product uploads validate the selected collection/category and use `postmart/<collection>/<category>`. Storefront assets use approved folders such as `postmart/storefront/hero` and `postmart/storefront/lifestyle`. Legacy admin uploads retain their existing configured folder.

Purpose: product image storage and delivery.

Server implementation: `services/upload/image-upload-service.js`.

Variables:

- Server-only: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER`.
- Existing widget support: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

The server upload folder is `CLOUDINARY_UPLOAD_FOLDER`, falling back to `aere/products`. New-admin uses local JPG/PNG/WEBP files and never receives the Cloudinary API secret.

## Razorpay

Purpose: online payment orders, browser checkout, server verification, and payment webhooks.

Variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

The server verifies browser payment signatures, fetches payment status, matches amounts, enforces checkout ownership, and processes webhooks idempotently.

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

Purpose: checkout locks and cache helpers when configured.

Variable: `REDIS_URL`.

Rate limiting is currently in-memory and is not automatically made multi-instance by Redis being present.

## Google Maps Platform

Purpose: customer address/location assistance and server geocoding.

- Public/referrer-restricted: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.
- Server-only: `GOOGLE_GEOCODING_API_KEY`, `GOOGLE_GEOLOCATION_API_KEY`.

## Vercel

The repository includes Vercel Analytics and Speed Insights. Deployment is expected to provide environment variables and webhook endpoints, but actual production state must be verified outside source code.
