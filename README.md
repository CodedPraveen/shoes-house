# Shoes House

Shoes House is a shoes and jewellery e-commerce application built with Next.js App Router. It provides product discovery, guest shopping, checkout, payments, order fulfilment, shipment tracking, and administrator operations.

> **Documentation status:** This documentation describes the current verified platform and the approved guest-only customer experience. Guest checkout, private-link order access, and Resend email integration are target changes until their implementation and tests are complete. Do not treat a planned feature as deployed.

## Customer experience

- Browse shoes and jewellery without an account.
- Search, filter, and view product details and variants.
- Use a browser-persisted guest cart.
- Place orders through CART checkout or Buy Now.
- Pay using Razorpay or choose Cash on Delivery where enabled.
- View an individual order using its private order-access link. No customer login, signup, password, or OTP is required.
- Receive transactional order emails through Resend after that integration is implemented.

There is no customer account/profile area in the target experience. Do not add customer login, signup, customer OTP, or account-based order history.

## Administrator experience

Clerk remains for administrators. The `/admin` and `/new-admin` systems remain protected; customer authentication removal must not weaken or remove administrator authorization.

## Technology

| Area | Technology |
|---|---|
| Web | Next.js 16 App Router, React 19 |
| Language/UI | JavaScript, Tailwind CSS 4, Framer Motion |
| Data | Prisma 6, PostgreSQL/Supabase |
| Admin authentication | Clerk, Svix webhook verification |
| Payments | Razorpay |
| Shipment tracking | AfterShip (India Post workflow) |
| Image processing | Persistent filesystem, Sharp, BullMQ |
| Queue/cache/locking | Redis, BullMQ, ioredis |
| Transactional email | Resend (approved initial provider; implementation pending) |
| Location | Google Maps Platform |
| Hosting | Docker-based Next.js + worker topology; verify actual production hosting before deployment |

## Local setup

```bash
npm install
npm run setup
npm run dev
```

Use `.env.example` as the environment-variable reference. Never commit secrets.

## Useful commands

```bash
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

Use `db:push` for local development synchronization only. Use reviewed Prisma migrations for production.

## Architecture and documentation

Start with [`docs/README.md`](./docs/README.md). It links the technical documentation and explains the current-versus-planned status convention.

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- [`docs/AUTH.md`](./docs/AUTH.md)
- [`docs/FLOWS.md`](./docs/FLOWS.md)
- [`docs/DATABASE.md`](./docs/DATABASE.md)
- [`docs/API.md`](./docs/API.md)
- [`docs/INTEGRATIONS.md`](./docs/INTEGRATIONS.md)
- [`docs/SECURITY.md`](./docs/SECURITY.md)
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)

Source code and the deployed environment remain the final source of truth.
