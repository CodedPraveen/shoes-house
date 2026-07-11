# Shoes House — Scalable Ecommerce

A modern, scalable eCommerce platform built with **Next.js**, **Prisma**, **Supabase**, **Clerk**, **Razorpay**, and **Cloudinary**.

---

# 🚀 Tech Stack

- Next.js 16 (App Router)
- React 19
- Prisma ORM
- Supabase PostgreSQL
- Clerk Authentication
- Razorpay Payments
- Cloudinary Image Storage
- Tailwind CSS
- Vercel

---

## Installation

```bash
git clone https://github.com/CodedPraveen/shoes-house.git
cd shoes-house

cp .env
# Copy-Item .env

# Fill in all required environment variables

npm install
```

---

# 💻 Local Development

## First Time Setup

```bash
npm run setup
```

This command will:

- Generate Prisma Client
- Sync the database schema
- Seed the database

Start the development server:

```bash
npm run dev
```

Daily development:

```bash
npm run dev
```

# .env Variables
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Meta Pixel 
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=  # remember webhook use in devlopment

# add phone no
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/profile
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/profile

ADMIN_EMAILS=

#ORM
DATABASE_URL=
DIRECT_URL=

# Razorpay
RAZORPAY_KEY_ID=   
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Aftership (shipping API)
AFTERSHIP_API_KEY=
AFTERSHIP_WEBHOOK_SECRET=
```

---

# 🗄 Database Commands

Generate Prisma Client

```bash
npm run db:generate
```

Push schema changes (Development only)

```bash
npm run db:push
```

Create a new migration

```bash
npm run db:migrate
```

Apply migrations (Production)

```bash
npm run db:deploy
```

Seed database

```bash
npm run db:seed
```

Open Prisma Studio

```bash
npm run db:studio
```

---

# 🚀 Production Deployment

Build the application

```bash
npm run build
```

Apply database migrations

```bash
npm run db:deploy
```

Start the production server

```bash
npm run start
```

> **Note**
>
> - Use **`db:push` only during local development**.
> - Use **`db:deploy` for Docker, Kubernetes, AWS, and production environments**.

---

# 📚 Documentation

| File | Purpose |
|------|---------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Complete project overview, stack, folder structure, and business logic |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, Mermaid diagrams, services, and webhooks |
| [PERFORMANCE_REPORT.md](./PERFORMANCE_REPORT.md) | Performance analysis and optimizations |
| [ROADMAP.md](./ROADMAP.md) | Development roadmap |
| [DECISIONS.md](./DECISIONS.md) | Architecture decision records |

---

# 🛍 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Product catalog |
| `/product/[slug]` | Product details |
| `/cart` | Shopping cart |
| `/checkout` | Cart checkout |
| `/checkout/buy-now` | Buy Now checkout |
| `/orders` | User order history |
| `/admin` | Admin dashboard |

---

# ⚡ Performance Debugging

Enable performance logs

```bash
PERF_LOG=1 npm run dev
```

Watch the terminal for logs like:

```
[perf] cart.add
[perf] checkout.create
[perf] checkout.complete
```

---

# 📁 Project Scripts

| Command | Description |
|---------|-------------|
| `npm run setup` | Initial project setup (generate + push + seed) |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema changes (Development only) |
| `npm run db:migrate` | Create a new Prisma migration |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

# 🐳 Docker / Kubernetes / AWS Workflow

### Build

```bash
npm install
npm run build
```

### Start

```bash
npm run db:deploy
npm run start
```

This workflow is recommended for:

- Docker
- Kubernetes
- AWS ECS
- AWS EKS
- EC2
- CI/CD Pipelines

---

# 📄 License

Private project.