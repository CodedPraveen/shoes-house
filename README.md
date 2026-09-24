# 🛍️ PostMart

**PostMart** is a premium sneaker e-commerce platform built with Next.js. It provides a complete shopping experience with product browsing, cart and wishlist management, checkout, Razorpay payments, order management, shipping integration, and an admin dashboard.

🌐 **Production:** https://thepostmart.com
📦 **Repository:** https://github.com/CodedPraveen/shoes-house

---

## ✨ Features

### 🛒 Storefront

* Product catalog
* Product categories
* Product collections
* Product search
* Product filtering
* Product details
* Slug-based product URLs
* Product colors, sizes and variants
* Shopping cart
* Wishlist
* Recently viewed products
* Responsive mobile-first UI

### 👤 Authentication

* Clerk authentication
* Sign in / Sign up
* User profiles
* Guest shopping support
* Signed-in user cart and wishlist
* Clerk webhook user synchronization
* Admin role protection

### 💳 Checkout & Payments

* Cart checkout
* Buy Now checkout
* Razorpay integration
* Razorpay webhook processing
* Payment signature verification
* Payment amount verification
* Idempotent payment handling
* Order creation after verified payment
* Inventory reduction after successful payment

> Razorpay webhook events are treated as the source of truth for successful payments.

### 📦 Orders

* Order creation
* Order history
* Order status management
* Invoice download
* Payment status
* Shipping information
* Order item snapshots

### 📊 Inventory

* Product variant inventory
* Stock tracking
* Inventory movements
* Atomic stock decrement
* Overselling protection
* Inventory updates only after verified payment

### 🛠️ Admin

* Admin dashboard
* Product creation
* Product editing
* Product soft-delete
* Product search
* Product filtering
* Product pagination
* Inventory management
* Order management
* Product image uploads
* Cloudinary integration

### 🚚 Shipping

* AfterShip integration
* Shipment tracking
* Shipping webhook support

### 📍 Address & Location

* Saved addresses
* Default address
* Manual address entry
* Google Maps integration
* Location-based address filling
* Google Geocoding API
* Optional Google Geolocation API

### 📧 Newsletter

* Newsletter subscription
* Rate limiting against spam

---

# 🧱 Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Framework      | Next.js 16 App Router |
| UI             | React 19              |
| Styling        | Tailwind CSS 4        |
| Animation      | Framer Motion         |
| Database       | Supabase PostgreSQL   |
| ORM            | Prisma 6.19           |
| Authentication | Clerk                 |
| Payments       | Razorpay              |
| Shipping       | AfterShip             |
| Images         | Cloudinary            |
| Queue          | BullMQ                |
| Redis          | Redis 7.4             |
| Validation     | Zod                   |
| Maps           | Google Maps Platform  |
| Production     | Docker                |

---

# 🏗️ Architecture

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── Server Components
   ├── Server Actions
   └── API Routes
          │
          ▼
       Services
          │
          ▼
        Prisma
          │
          ▼
Supabase PostgreSQL
```

Background jobs:

```text
Next.js
   │
   ▼
BullMQ
   │
   ▼
Redis
   │
   ▼
Worker
```

External services:

```text
Clerk       → Authentication
Razorpay    → Payments
AfterShip   → Shipping
Cloudinary  → Product Images
Google Maps → Address / Location
```

For a detailed architecture overview, see:

* [`ARCHITECTURE.md`](./ARCHITECTURE.md)
* [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)

---

# 📁 Project Structure

```text
shoes-house/
│
├── app/
│   ├── (shop)/
│   ├── (admin)/
│   │   └── admin/
│   ├── api/
│   └── ...
│
├── actions/
│   └── Server Actions
│
├── components/
│   └── UI components
│
├── context/
│   ├── Cart
│   ├── Wishlist
│   ├── Search
│   └── Recently Viewed
│
├── lib/
│   ├── cache
│   ├── cart utilities
│   ├── performance
│   └── rate limiting
│
├── services/
│   └── Business logic
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── workers/
│   └── Background job worker
│
├── public/
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/CodedPraveen/shoes-house.git
cd shoes-house
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then fill in the required values.

> Never commit your `.env` file or production secrets.

---

# 🔐 Environment Variables

The repository provides the current environment template in:

```text
.env.example
```

Main configuration groups include:

### Application

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
```

### Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

ADMIN_EMAILS=
ADMIN_URL=/new-admin
```

### Database

```env
DATABASE_URL=
DIRECT_URL=
```

`DATABASE_URL` is used for the application database connection.

`DIRECT_URL` is used for Prisma migration/database operations.

### Razorpay

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

### AfterShip

```env
AFTERSHIP_API_KEY=
AFTERSHIP_WEBHOOK_SECRET=
```

### Redis / BullMQ

```env
REDIS_URL=redis://redis:6379
REDIS_PORT=6379
REDIS_PASSWORD=

BULLMQ_WORKER_CONCURRENCY=3
BULLMQ_WORKER_RATE_MAX=20
BULLMQ_WORKER_RATE_DURATION_MS=10000
BULLMQ_REDIS_CONNECT_TIMEOUT_MS=3000
```

### Google Maps

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=

GOOGLE_GEOCODING_API_KEY=
GOOGLE_GEOLOCATION_API_KEY=
```

For the complete list and current comments, always refer to `.env.example`.

---

# 💻 Development

## Start the application

```bash
npm run dev
```

The development command starts:

```text
Next.js development server
        +
BullMQ worker
```

The application is available at:

```text
http://localhost:3000
```

---

# 🗄️ Database Commands

Generate Prisma Client:

```bash
npm run db:generate
```

Push the Prisma schema during local development:

```bash
npm run db:push
```

Create a migration:

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

---

# 🌱 Initial Database Setup

For a fresh local database:

```bash
npm run dev:setup
```

This performs:

```text
Prisma generate
      ↓
Database schema push
      ↓
Database seed
```

After setup:

```bash
npm run dev
```

---

# 📜 Available Scripts

| Command               | Purpose                         |
| --------------------- | ------------------------------- |
| `npm run dev`         | Start Next.js + worker          |
| `npm run dev:next`    | Start only Next.js              |
| `npm run worker`      | Start worker in development     |
| `npm run worker:prod` | Start production worker         |
| `npm run build`       | Build production application    |
| `npm run start`       | Start production Next.js server |
| `npm run lint`        | Run ESLint                      |
| `npm run dev:setup`   | Generate, push schema and seed  |
| `npm run db:generate` | Generate Prisma Client          |
| `npm run db:push`     | Push schema                     |
| `npm run db:migrate`  | Create development migration    |
| `npm run db:deploy`   | Apply production migrations     |
| `npm run db:seed`     | Seed database                   |
| `npm run db:studio`   | Open Prisma Studio              |

---

# 🐳 Docker

PostMart includes a Docker Compose setup with three services:

```text
┌──────────────────────┐
│       nextjs         │
│   Next.js server     │
└──────────┬───────────┘
           │
           │
┌──────────▼───────────┐
│       worker         │
│    BullMQ worker     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│        redis         │
│     Redis 7.4        │
└──────────────────────┘
```

## Build containers

```bash
docker compose build
```

## Start containers

```bash
docker compose up -d
```

## Check containers

```bash
docker compose ps
```

## View logs

```bash
docker compose logs -f
```

View only Next.js logs:

```bash
docker compose logs -f nextjs
```

View worker logs:

```bash
docker compose logs -f worker
```

View Redis logs:

```bash
docker compose logs -f redis
```

## Apply database migrations

```bash
docker compose exec nextjs npm run db:deploy
```

---

# 💾 Persistent Storage

Docker Compose uses persistent volumes for application data:

```text
image-data
    ↓
/data/ecommerce/images
```

and:

```text
redis-data
    ↓
/data
```

This allows product image storage and Redis data to survive container recreation.

---

# 💳 Checkout Flow

PostMart supports two checkout modes:

### Cart Checkout

```text
Cart
 ↓
Checkout
 ↓
Razorpay
 ↓
Payment
 ↓
Razorpay Webhook
 ↓
Verify Payment
 ↓
Create / Fulfill Order
 ↓
Reduce Inventory
 ↓
Clear Cart
```

### Buy Now

```text
Product
 ↓
Buy Now
 ↓
Checkout
 ↓
Razorpay
 ↓
Razorpay Webhook
 ↓
Verify Payment
 ↓
Create / Fulfill Order
 ↓
Reduce Inventory
```

The Buy Now flow does not use the normal cart-clearing behavior.

---

# 🔐 Payment Security

Payment completion is not trusted from the browser alone.

The Razorpay webhook verifies:

* Webhook signature
* Payment amount
* Payment state
* Duplicate events
* Order/payment consistency

Only after successful verification should inventory and order state be updated.

---

# 📦 Inventory Protection

Inventory is managed at the product variant level.

The application uses atomic stock updates to prevent overselling.

```text
Checkout
   ↓
Payment
   ↓
Webhook verification
   ↓
Atomic stock update
   ↓
InventoryMovement
   ↓
Order fulfillment
```

Stock is **not reserved simply because a product was added to the cart or checkout was started**.

---

# 🔗 Important Routes

## Storefront

| Route               | Purpose          |
| ------------------- | ---------------- |
| `/`                 | Homepage         |
| `/products`         | Product listing  |
| `/product/[slug]`   | Product details  |
| `/cart`             | Shopping cart    |
| `/checkout`         | Checkout         |
| `/checkout/buy-now` | Buy Now checkout |
| `/orders`           | Customer orders  |
| `/profile`          | Customer profile |

## Admin

| Route                       | Purpose            |
| --------------------------- | ------------------ |
| `/admin`                    | Admin dashboard    |
| `/admin/products`           | Product management |
| `/admin/products/new`       | Create product     |
| `/admin/products/[id]/edit` | Edit product       |
| `/admin/orders`             | Order management   |

---

# 🔔 Webhooks

PostMart receives events from external services through API routes.

### Razorpay

```text
/api/webhooks/razorpay
```

Used for payment verification and order fulfillment.

### Clerk

Clerk webhook events are used to synchronize users with the application database.

### AfterShip

AfterShip webhook events are used for shipment/tracking updates.

---

# 🖼️ Product Images

Product images are uploaded through the admin system and stored using Cloudinary.

The application keeps product image references with the product data rather than storing large image files directly inside the database.

---

# 📍 Google Maps

Google Maps Platform is used for address and location functionality.

The project uses:

* Maps JavaScript API
* Geocoding API
* Optional Geolocation API

The browser-exposed Maps key should be restricted by HTTP referrer.

Server-side Google API keys should be restricted to the APIs they actually use.

---

# 🛡️ Rate Limiting

The application includes IP-based rate limiting for sensitive operations including:

* Checkout
* Cart operations
* Newsletter
* Admin mutations
* Geocoding
* Webhooks

This helps protect expensive or sensitive endpoints from excessive requests.

---

# 🧪 Testing Checklist

Important areas to test before production deployment:

### Payments

* Duplicate Razorpay webhook
* Invalid Razorpay signature
* Incorrect payment amount
* Successful payment
* Payment idempotency

### Inventory

* Multiple users purchasing the last unit
* Out-of-stock handling
* Inventory movement creation
* Stock changes only after verified payment

### Cart

* Guest cart
* Signed-in cart
* Cart merge after authentication

### Addresses

* Create address
* Edit address
* Delete address
* Default address
* Saved address at checkout
* Manual address entry
* Location-based address filling

### Orders

* Order creation
* Order history
* Order status
* Invoice generation

### Admin

* Create product
* Edit product
* Soft-delete product
* Product image upload
* Product visibility
* Order management
* Inventory history

---

# 📚 Documentation

| Document                                           | Description                                 |
| -------------------------------------------------- | ------------------------------------------- |
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md)       | Complete project context and business logic |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)             | Application architecture and data flow      |
| [`PERFORMANCE_REPORT.md`](./PERFORMANCE_REPORT.md) | Performance analysis                        |
| [`ROADMAP.md`](./ROADMAP.md)                       | Development roadmap                         |
| [`DECISIONS.md`](./DECISIONS.md)                   | Architecture decisions                      |

---

# 🚀 Production Deployment

Production deployment uses the production build and Docker environment.

Build:

```bash
npm run build
```

Apply database migrations:

```bash
npm run db:deploy
```

Start Next.js:

```bash
npm run start
```

Start the worker:

```bash
npm run worker:prod
```

For Docker deployment:

```bash
docker compose build
docker compose up -d
```

Then apply migrations:

```bash
docker compose exec nextjs npm run db:deploy
```

---

# ⚠️ Development vs Production Database Commands

### Local development

```bash
npm run db:push
```

Useful when iterating quickly on the Prisma schema.

### Production

```bash
npm run db:deploy
```

Use migrations for production database changes.

Do **not** use `db:push` as the normal production deployment mechanism.

---

# 🔄 Development Workflow

```text
Create branch
     ↓
Make changes
     ↓
Run npm run dev
     ↓
Test
     ↓
Run npm run lint
     ↓
Commit
     ↓
Create Pull Request
     ↓
Review
     ↓
Merge into main
     ↓
Deploy
```

---

# 📄 License

This is a private commercial project.

All rights reserved.
