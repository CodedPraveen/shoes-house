# Post Mart

**Post Mart** is an e-commerce application for shoes and jewellery, built with Next.js App Router. The platform covers product discovery, shopping carts, checkout, payments, order fulfilment, shipment tracking, and administrator operations.

- **Production:** https://thepostmart.com
- **Repository:** https://github.com/CodedPraveen/shoes-house

> **Documentation status:** This README combines the detailed project documentation with the newer product-direction and architecture notes. It distinguishes existing platform capabilities from approved changes that may still require implementation and testing. The deployed application, source code, Prisma schema, package scripts, and `.env.example` remain the final sources of truth.

---

## Contents

- [Product overview](#product-overview)
- [Customer experience](#customer-experience)
- [Administrator experience](#administrator-experience)
- [Features](#features)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Development](#development)
- [Database commands](#database-commands)
- [Available scripts](#available-scripts)
- [Docker](#docker)
- [Persistent storage and background jobs](#persistent-storage-and-background-jobs)
- [Checkout and payment flow](#checkout-and-payment-flow)
- [Payment security](#payment-security)
- [Inventory](#inventory)
- [Routes and APIs](#routes-and-apis)
- [Integrations and webhooks](#integrations-and-webhooks)
- [Product images](#product-images)
- [Maps and addresses](#maps-and-addresses)
- [Rate limiting and security](#rate-limiting-and-security)
- [Testing checklist](#testing-checklist)
- [Documentation](#documentation)
- [Production deployment](#production-deployment)
- [Development workflow](#development-workflow)
- [License](#license)

---

## Product overview

Post Mart is designed to provide a responsive shopping experience for shoes and jewellery, together with operational tools for managing products, inventory, orders, payments, and shipments.

The project uses a Next.js application, Prisma-backed PostgreSQL database, external payment and shipping providers, and background workers for asynchronous tasks.

## Customer experience

The approved product direction is a **guest-first shopping experience**:

- Browse shoes and jewellery without creating an account.
- Discover products through categories, collections, search, and filters.
- View product details, images, sizes, colours, and variants.
- Add products to a browser-persisted guest cart.
- Continue through Cart Checkout or Buy Now.
- Pay using Razorpay or choose Cash on Delivery (COD) where enabled.
- Access an individual order through a private order-access link.
- Receive order-related email communications through Resend after that integration is implemented and tested.

### Guest-only direction and implementation status

The following are product requirements, not claims that every item is already live:

- Customer login, signup, password, OTP, and customer account/profile flows are not part of the approved target customer experience.
- Customer order access should be through a private order-access link, not a customer account order-history area.
- Guest checkout and private order access require the corresponding database, checkout, API, and UI implementation to be complete and tested before being described as production-ready.
- Resend is the selected email provider; its integration remains pending until implemented and verified.

Do not remove authentication code or change customer APIs solely on the basis of this product direction. Check all web, mobile, admin, webhook, and service dependencies before changing authentication.

## Administrator experience

Clerk remains the authentication provider for administrators.

- `/admin` and `/new-admin` must remain protected.
- Administrator access must continue to be role/allowlist controlled.
- Admin product, inventory, and order operations must not become publicly accessible as part of guest checkout work.

---

## Features

### Storefront and product discovery

- Product catalogue
- Product categories and collections
- Product search and filtering
- Product detail pages
- Slug-based product URLs
- Product colours, sizes, and variants
- Responsive, mobile-first interface
- Recently viewed products
- Wishlist functionality where supported by the current implementation

### Cart and checkout

- Cart checkout
- Buy Now checkout
- Guest shopping support in the approved product direction
- Browser-persisted guest cart in the target experience
- Razorpay payment integration
- COD where enabled
- Checkout validation and order creation
- Cart clearing after the relevant successful checkout flow

### Payments and orders

- Razorpay order/payment integration
- Razorpay webhook processing
- Payment signature verification
- Payment amount and state verification
- Duplicate-event/idempotency handling
- Order item snapshots
- Order and payment status management
- Invoice generation/download where implemented
- Shipping information and tracking

### Inventory

- Product-variant-level stock
- Stock tracking
- Inventory movement records
- Atomic stock updates where implemented
- Overselling protection through transactional/conditional stock updates
- Inventory changes tied to the verified order/payment lifecycle

> Stock must not be treated as reserved merely because an item was added to a cart or checkout was started. COD order creation, stock reservation, cancellation, and restocking need explicitly defined and tested rules.

### Administrator tools

- Admin dashboard
- Product creation and editing
- Product soft deletion
- Product search, filtering, and pagination
- Inventory management
- Order management
- Product image upload

### Shipping and location

- AfterShip integration
- Shipment tracking and webhook support
- Address entry and management where currently implemented
- Google Maps Platform integration for supported address/location flows

### Communications

- Newsletter subscription and rate limiting where implemented
- Resend as the approved provider for future/ongoing transactional email integration

---

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Language | JavaScript |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Database | PostgreSQL / Supabase PostgreSQL |
| ORM | Prisma 6 |
| Administrator authentication | Clerk |
| Payments | Razorpay |
| Shipping | AfterShip |
| Background jobs | BullMQ |
| Queue storage | Redis 7.4 |
| Validation | Zod |
| Maps and geocoding | Google Maps Platform |
| Image processing | Sharp (for the persistent-storage workflow) |
| Email | Resend (selected; integration pending verification) |
| Deployment | Docker / Docker Compose |

Always confirm exact installed versions and enabled integrations from `package.json`, lockfiles, environment configuration, and the deployed environment.

---

## Architecture

### Application request flow

```text
Browser / Client
      |
      v
Next.js App Router
      |
      +-- Server Components
      +-- Server Actions
      +-- Route Handlers / API Routes
      |
      v
Application Services
      |
      v
Prisma ORM
      |
      v
PostgreSQL / Supabase
```

### Background processing

```text
Next.js Application
      |
      v
BullMQ Queue
      |
      v
Redis
      |
      v
Background Worker
      |
      +-- Image processing jobs
      +-- Other asynchronous tasks
```

### External services

```text
Clerk        -> Administrator authentication
Razorpay     -> Payment processing
AfterShip    -> Shipment tracking
Google Maps  -> Maps, geocoding and location
Resend       -> Transactional email (selected; pending integration)
```

The newer deployment direction uses a separate Next.js application and worker process, with Redis available to the worker. Verify the actual Compose file and production topology before changing service names or deployment assumptions.

---

## Project structure

The repository is organized around the Next.js application, shared components, business services, Prisma database layer, and background workers. The exact tree can evolve; use the checked-out repository as the source of truth.

```text
shoes-house/
├── app/
│   ├── (shop)/
│   ├── (admin)/
│   ├── api/
│   └── ...
├── actions/
├── components/
├── context/
├── lib/
├── services/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── workers/
├── public/
├── docs/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

Typical responsibilities:

- `app/` — App Router pages, layouts, route handlers, and route groups.
- `actions/` — server actions.
- `components/` — reusable UI components.
- `context/` — shared client state such as cart, wishlist, search, and recently viewed state.
- `lib/` — shared utilities, caching, performance, and rate-limiting helpers.
- `services/` — business logic and integrations.
- `prisma/` — database schema, migrations, and seed logic.
- `workers/` — BullMQ background worker processes.
- `docs/` — project, architecture, security, deployment, and workflow documentation.

---

## Getting started

### Requirements

Install the versions of Node.js and npm supported by the repository. You will also need access to a PostgreSQL database for database-backed development. Redis is required for workflows that use BullMQ.

### 1. Clone the repository

```bash
git clone https://github.com/CodedPraveen/shoes-house.git
cd shoes-house
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill in the values required by the services you intend to run. Do not commit `.env`, API keys, private keys, webhook secrets, or production credentials.

### 4. Prepare the database

Use the setup command documented by the current repository scripts. The newer project instructions specify:

```bash
npm run setup
```

If that script is not present in the checked-out `package.json`, follow the individual Prisma commands in [Database commands](#database-commands) and the scripts actually defined by the repository. Do not assume a script exists just because it appears in documentation.

### 5. Start development

```bash
npm run dev
```

The development command is intended to start the application and its worker where configured. If you need to run them separately, use the scripts available in `package.json`.

Open:

```text
http://localhost:3000
```

---

## Environment configuration

The repository's `.env.example` is the authoritative list of supported environment variables. The following are configuration groups and examples carried forward from the project documentation; variable names may change as integrations evolve.

### Application

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
```

### Clerk — administrator authentication

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

ADMIN_EMAILS=
ADMIN_URL=/new-admin
```

Older customer-authentication redirect variables may still exist in the current environment template or codebase. Their presence does not change the approved guest-only customer direction. Audit references before removing or repurposing them.

### Database

```env
DATABASE_URL=
DIRECT_URL=
```

- `DATABASE_URL` is the application database connection string.
- `DIRECT_URL` is used for direct Prisma migration/database operations when configured.

Use the connection mode and pooling configuration required by the actual PostgreSQL/Supabase environment.

### Razorpay

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Keep secret values server-side. Never expose the Razorpay secret or webhook secret through a `NEXT_PUBLIC_` variable.

### AfterShip

```env
AFTERSHIP_API_KEY=
AFTERSHIP_WEBHOOK_SECRET=
```

### Redis and BullMQ

```env
REDIS_URL=redis://redis:6379
REDIS_PORT=6379
REDIS_PASSWORD=

BULLMQ_WORKER_CONCURRENCY=3
BULLMQ_WORKER_RATE_MAX=20
BULLMQ_WORKER_RATE_DURATION_MS=10000
BULLMQ_REDIS_CONNECT_TIMEOUT_MS=3000
```

Use the Redis hostname and credentials appropriate to the environment. The Compose service hostname `redis` is normally only valid inside the Compose network.

### Google Maps

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=

GOOGLE_GEOCODING_API_KEY=
GOOGLE_GEOLOCATION_API_KEY=
```

Restrict browser keys by allowed HTTP referrers and server keys by the APIs they need.

### Email

Resend is the selected email provider for the planned transactional email workflow. Add and document its environment variables only when the implementation defines the exact variable names. Do not invent variable names or place API keys in client-exposed variables.

> For the complete, current list and comments, refer to `.env.example`. Never copy production secrets into issues, pull requests, logs, screenshots, or documentation.

---

## Development

Start the application:

```bash
npm run dev
```

The project development workflow may start both:

```text
Next.js development server
          +
BullMQ worker
```

If the combined command is unavailable or you need to isolate a process, inspect `package.json` and use the defined Next.js-only and worker scripts.

Common local URL:

```text
http://localhost:3000
```

---

## Database commands

The following commands are documented by the project. Confirm each script exists in the current `package.json` before running it.

Generate Prisma Client:

```bash
npm run db:generate
```

Push the Prisma schema for local development:

```bash
npm run db:push
```

Create a development migration:

```bash
npm run db:migrate
```

Apply existing migrations:

```bash
npm run db:deploy
```

Seed the database:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

### Fresh local database

The previous project setup documentation defines:

```bash
npm run dev:setup
```

The newer README revision specifies:

```bash
npm run setup
```

These names are not interchangeable unless both scripts are actually defined. Check `package.json` and use the command present in the branch you are running. A typical setup sequence is:

```text
Generate Prisma Client
        |
        v
Prepare local schema / migrations
        |
        v
Seed development data
```

### Development versus production

For local schema iteration, `db:push` may be convenient:

```bash
npm run db:push
```

For production, apply reviewed migrations:

```bash
npm run db:deploy
```

Do not use `db:push` as the normal production deployment mechanism. Back up important data and review migrations before applying them to production.

---

## Available scripts

The detailed README previously documented these scripts. Treat this table as a reference, not a substitute for `package.json`; script names and behavior must be confirmed against the current branch.

| Command | Documented purpose |
| --- | --- |
| `npm run dev` | Start Next.js and worker in development |
| `npm run dev:next` | Start only Next.js |
| `npm run worker` | Start worker in development |
| `npm run worker:prod` | Start production worker |
| `npm run build` | Build the production application |
| `npm run start` | Start the production Next.js server |
| `npm run lint` | Run ESLint |
| `npm run dev:setup` | Generate client, push local schema, and seed |
| `npm run setup` | Setup command in the newer README revision; verify it exists |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema (local development) |
| `npm run db:migrate` | Create a development migration |
| `npm run db:deploy` | Apply production migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

## Docker

The project includes Docker-based deployment configuration. The documented topology contains the Next.js application, a BullMQ worker, and Redis.

```text
+-----------------------+
|        nextjs         |
|   Next.js application |
+-----------+-----------+
            |
            v
+-----------------------+
|        worker         |
|    BullMQ worker      |
+-----------+-----------+
            |
            v
+-----------------------+
|         redis         |
|      Redis 7.4        |
+-----------------------+
```

### Build images

```bash
docker compose build
```

### Start services

```bash
docker compose up -d
```

### Check service status

```bash
docker compose ps
```

### View logs

```bash
docker compose logs -f
```

Next.js logs:

```bash
docker compose logs -f nextjs
```

Worker logs:

```bash
docker compose logs -f worker
```

Redis logs:

```bash
docker compose logs -f redis
```

### Apply production migrations

```bash
docker compose exec nextjs npm run db:deploy
```

Run commands using the service names defined in the current `docker-compose.yml`. Do not assume the service topology above is unchanged without checking the Compose file.

---

## Persistent storage and background jobs

The newer architecture direction uses persistent local storage for uploaded product images, with image processing handled by Sharp and asynchronous jobs handled by BullMQ/Redis.

The earlier Docker documentation describes persistent volumes similar to:

```text
image-data
    |
    v
/data/ecommerce/images
```

and:

```text
redis-data
    |
    v
/data
```

The exact mount points and volume names must match the current `docker-compose.yml` and application configuration. Ensure that:

- Uploaded files are stored on a persistent volume, not only in a disposable container layer.
- The Next.js application and worker can access the required shared image storage.
- Redis data persistence is configured according to operational needs.
- Backups cover product images and the database.
- File validation, size limits, access controls, and safe image processing are enforced.

### Image-provider transition

The newer project direction moves new product-image uploads toward persistent filesystem storage with Sharp processing and background jobs. Existing Cloudinary image URLs may remain in stored product records for compatibility with historical content.

Treat existing Cloudinary URLs as read-only compatibility unless a deliberate migration is planned. Do not remove Cloudinary references or delete remote assets until all records and consumers have been audited.

---

## Checkout and payment flow

The project documents two main checkout entry points: Cart Checkout and Buy Now.

### Cart Checkout

```text
Customer cart
     |
     v
Checkout validation
     |
     v
Create / initiate payment
     |
     v
Razorpay payment
     |
     v
Verify payment through trusted server flow
     |
     v
Create / confirm order
     |
     v
Update inventory safely
     |
     v
Clear the purchased cart items
```

### Buy Now

```text
Product and selected variant
     |
     v
Buy Now checkout
     |
     v
Create / initiate payment
     |
     v
Razorpay payment
     |
     v
Verify payment through trusted server flow
     |
     v
Create / confirm order
     |
     v
Update inventory safely
```

Buy Now should use its own purchase context and should not accidentally clear unrelated items from the normal cart.

### Guest checkout target

The approved target experience allows customers to check out without creating a customer account. Implementing this safely may require coordinated changes to:

- Checkout UI and validation
- Checkout/session ownership
- Order ownership and database constraints
- Payment creation and verification
- Webhook processing
- Order confirmation and private order-access links
- Email notifications
- Mobile/API clients that currently expect authenticated customer identity

Do not mark guest checkout as fully implemented until the complete flow is verified end to end.

---

## Payment security

Payment success must never be trusted solely because the browser reports success.

The trusted server-side payment flow should validate, as applicable:

- Razorpay webhook signature
- Payment/order association
- Expected payment amount and currency
- Payment state
- Duplicate webhook events
- Order/payment consistency
- Idempotent state transitions

The Razorpay webhook endpoint is a critical part of payment confirmation. Preserve signature verification and idempotency safeguards when changing checkout or order ownership.

Only a verified payment event should trigger the corresponding paid-order and inventory transitions. Handle retries safely so the same event cannot create duplicate orders or decrement stock more than once.

---

## Inventory

Inventory is managed at product-variant level where variants are used.

The documented paid-order flow is:

```text
Checkout
    |
    v
Payment confirmation
    |
    v
Verified server-side event
    |
    v
Atomic / conditional stock update
    |
    v
Inventory movement record
    |
    v
Order fulfilment
```

Important rules:

- Do not decrement stock merely because a product was added to a cart.
- Do not assume that starting checkout reserves stock.
- Protect the final unit from concurrent purchases.
- Make stock updates and order state transitions transaction-safe.
- Record inventory movements when supported by the schema.
- Ensure retries and duplicate webhook events cannot decrement stock twice.
- Define separate, tested behavior for COD orders, cancellation, failed delivery, refunds, and restocking.

COD inventory handling must be verified in the current implementation; do not assume its reservation/decrement lifecycle is identical to a verified online payment.

---

## Routes and APIs

The exact routes are determined by the current `app/` directory. The following routes were documented by the earlier README and should be checked against the current source before relying on them.

### Storefront routes (previously documented)

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/products` | Product listing |
| `/product/[slug]` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Cart checkout |
| `/checkout/buy-now` | Buy Now checkout |
| `/orders` | Previously documented customer orders route; review against guest-only target |
| `/profile` | Previously documented customer profile route; not part of the approved guest-only target |

### Administrator routes (previously documented)

| Route | Purpose |
| --- | --- |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/products/new` | Create product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/orders` | Order management |
| `/new-admin` | Administrator entry route, protected by Clerk |

The guest-only product direction replaces customer account-based order history with an individual private order-access link. The final public order URL and route must be taken from the implemented application; do not guess a route or expose order records through predictable IDs.

### Webhook endpoint documented for Razorpay

```text
/api/webhooks/razorpay
```

Confirm the actual route handler and provider configuration in the current branch.

---

## Integrations and webhooks

### Razorpay

Used for online payment processing and payment event verification.

- Keep secret keys on the server.
- Verify webhook signatures.
- Validate payment amount and order association.
- Make event handling idempotent.
- Do not rely on client-side success callbacks as the final source of truth.

### Clerk

Clerk remains in use for administrator authentication.

The earlier implementation also documented Clerk user synchronization through webhooks. Review the current webhook handlers and data model before changing or removing customer-related synchronization; mobile and existing API consumers may depend on it.

### AfterShip

AfterShip is used for shipment tracking and related shipment updates. Verify webhook signatures/secrets and make update processing safe against duplicate or out-of-order events.

### Resend

Resend is the selected provider for the planned transactional email workflow. Treat it as pending until credentials, templates, send operations, failure handling, and end-to-end tests are in place.

### Google Maps Platform

Used for supported address and location features, including Maps JavaScript API and geocoding. The Geolocation API is optional and should only be enabled if the application uses it.

---

## Product images

The earlier implementation documentation describes Cloudinary-backed product image uploads. The newer architecture direction uses persistent filesystem storage for new uploads, with Sharp image processing and BullMQ background work.

When working on image storage:

- Preserve compatibility with existing product image references.
- Store new uploads on a persistent volume when that workflow is implemented.
- Ensure the application and worker share the required storage.
- Validate file type, size, and image contents.
- Process images safely and avoid blocking request handlers with expensive work.
- Back up persistent image data.
- Do not remove historical Cloudinary assets until references have been migrated and verified.

The database should store image references/metadata rather than large binary image payloads.

---

## Maps and addresses

Google Maps Platform is used for supported address and location functionality.

The earlier configuration documented:

- Maps JavaScript API
- Geocoding API
- Optional Geolocation API

Security guidance:

- Restrict browser-exposed Maps keys by HTTP referrer.
- Restrict server-side keys to the APIs they actually use.
- Keep server-side API keys out of client bundles.
- Validate and normalize address data on the server.
- Treat browser-provided location/address values as untrusted input.

Saved addresses and customer account address management were documented in the earlier implementation. Reconcile those flows with the guest-checkout target before keeping or removing customer account dependencies.

---

## Rate limiting and security

The earlier project documentation describes IP-based rate limiting for sensitive operations, including:

- Checkout
- Cart operations
- Newsletter subscription
- Admin mutations
- Geocoding
- Webhooks

Verify which routes are currently protected and whether the limiter is appropriate for the deployment topology. Reverse-proxy configuration must preserve trustworthy client IP handling.

Additional security expectations:

- Validate all user-controlled input on the server.
- Enforce administrator authorization on every admin operation, not only in the UI.
- Keep secrets server-side.
- Verify provider webhooks cryptographically.
- Make payment and inventory operations idempotent.
- Avoid exposing private order information through guessable identifiers.
- Apply safe upload validation and storage permissions.
- Avoid logging credentials, payment secrets, or sensitive customer data.

---

## Testing checklist

Run the relevant tests and manual checks before merging or deploying changes. This checklist combines the detailed previous README with the newer guest-checkout direction.

### Storefront

- [ ] Homepage and product listing load.
- [ ] Product search and filters work.
- [ ] Product detail and slug routes work.
- [ ] Variant selection validates correctly.
- [ ] Responsive layouts work on mobile and desktop.

### Cart and checkout

- [ ] Guest cart persists as designed.
- [ ] Cart quantities and variant selections are correct.
- [ ] Cart Checkout uses the intended cart items.
- [ ] Buy Now uses only the selected product/variant.
- [ ] Buy Now does not clear unrelated cart items.
- [ ] Invalid or unavailable products are rejected safely.
- [ ] Guest checkout works without customer login when the feature is implemented.
- [ ] Private order-access links do not expose other customers' orders.

### Payments

- [ ] Successful Razorpay payment.
- [ ] Failed payment.
- [ ] Invalid webhook signature.
- [ ] Incorrect amount or currency.
- [ ] Payment/order mismatch.
- [ ] Duplicate Razorpay webhook event.
- [ ] Webhook retry and idempotency.
- [ ] Browser callback cannot falsely mark an order paid.

### Inventory

- [ ] Multiple buyers competing for the final unit.
- [ ] Out-of-stock handling.
- [ ] Variant-specific stock updates.
- [ ] Inventory movement creation.
- [ ] Duplicate payment events do not decrement stock twice.
- [ ] COD order, cancellation, and restocking behavior.
- [ ] Failed/cancelled orders do not leave incorrect stock values.

### Orders and email

- [ ] Order creation and status transitions.
- [ ] Order item snapshots remain correct.
- [ ] Invoice generation/download where enabled.
- [ ] Private order-access link authorization.
- [ ] Resend email delivery, retry, and failure handling after integration is implemented.

### Administrator

- [ ] Unauthenticated users cannot access admin pages or APIs.
- [ ] Non-admin users cannot perform admin mutations.
- [ ] Create and edit product.
- [ ] Soft-delete product.
- [ ] Product visibility and pagination.
- [ ] Product image upload and processing.
- [ ] Inventory management.
- [ ] Order management.

### Shipping and integrations

- [ ] AfterShip tracking creation/update.
- [ ] Invalid shipment webhook is rejected.
- [ ] Duplicate/out-of-order shipment events are safe.
- [ ] Google Maps key restrictions and address flows.
- [ ] Redis/worker unavailable behavior is handled appropriately.

### Deployment

- [ ] Production build succeeds.
- [ ] Database migrations apply successfully.
- [ ] Next.js and worker containers start.
- [ ] Redis connectivity works.
- [ ] Persistent image volume survives container recreation.
- [ ] Logs do not expose secrets.
- [ ] Backups and restore procedure are documented.

---

## Documentation

The repository may contain the following project documents. Keep links only for files that exist in the checked-out branch.

| Document | Description |
| --- | --- |
| [`docs/README.md`](./docs/README.md) | Documentation index, if present |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Application architecture |
| [`docs/AUTH.md`](./docs/AUTH.md) | Authentication and authorization |
| [`docs/FLOWS.md`](./docs/FLOWS.md) | Customer, checkout, and operational flows |
| [`docs/DATABASE.md`](./docs/DATABASE.md) | Database schema and data model |
| [`docs/API.md`](./docs/API.md) | API and route documentation |
| [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md) | External integrations |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Security guidance |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Deployment instructions |
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) | Earlier project context document |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Earlier architecture document |
| [`PERFORMANCE_REPORT.md`](./PERFORMANCE_REPORT.md) | Performance analysis |
| [`ROADMAP.md`](./ROADMAP.md) | Development roadmap |
| [`DECISIONS.md`](./DECISIONS.md) | Architecture decisions |

Some documentation paths may not exist in every branch. Check the repository before adding or relying on a link. Keep this README aligned with implementation and update the relevant detailed document when behavior changes.

---

## Production deployment

Production deployment uses a production build, environment-specific secrets, database migrations, and the configured Docker services.

### Build

```bash
npm run build
```

### Apply migrations

```bash
npm run db:deploy
```

### Start the application and worker

The earlier deployment documentation lists:

```bash
npm run start
npm run worker:prod
```

Use the actual process manager or Docker Compose configuration used by the target environment.

### Docker deployment

```bash
docker compose build
docker compose up -d
docker compose ps
```

Apply migrations using the configured application service:

```bash
docker compose exec nextjs npm run db:deploy
```

### Production deployment checklist

- [ ] Confirm the deployment branch and commit.
- [ ] Confirm required environment variables are configured.
- [ ] Build the production image.
- [ ] Back up the database before risky schema changes.
- [ ] Apply reviewed Prisma migrations.
- [ ] Confirm Next.js, worker, and Redis health.
- [ ] Confirm persistent image storage is mounted.
- [ ] Verify payment and shipping webhook URLs.
- [ ] Verify administrator access.
- [ ] Run a controlled checkout/payment test.
- [ ] Check application and worker logs.
- [ ] Confirm backups and rollback procedure.

Do not run development schema-push commands as a substitute for production migrations.

---

## Development workflow

A typical contribution workflow:

```text
Create a feature branch
        |
        v
Implement a focused change
        |
        v
Run the application and relevant tests
        |
        v
Run lint / build checks
        |
        v
Review the diff
        |
        v
Commit the change
        |
        v
Open a pull request
        |
        v
Review and merge
        |
        v
Deploy through the production process
```

Before opening a pull request:

1. Keep changes scoped and avoid unrelated rewrites.
2. Update documentation when behavior, configuration, or deployment changes.
3. Never commit secrets or generated production data.
4. Verify database migrations and rollback implications.
5. Test payment, order, and inventory changes carefully.
6. Preserve administrator authorization.
7. Confirm README claims match the code that is actually merged.

---

## License

This is a private commercial project.

All rights reserved.
