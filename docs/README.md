# Post Mart — Project Documentation

> This directory is the technical source of truth for understanding the Post Mart ecommerce project before making code changes.

## Important

Before modifying this project:

1. Read this file.
2. Read [PROJECT.md](./PROJECT.md).
3. Read [STRUCTURE.md](./STRUCTURE.md).
4. Read [ARCHITECTURE.md](./ARCHITECTURE.md).
5. Read the documentation relevant to the requested feature.
6. Inspect the actual source code before making changes.

The source code is always the final source of truth.

## Documentation map

- [PROJECT.md](./PROJECT.md) — project overview, stack, status, and commands
- [STRUCTURE.md](./STRUCTURE.md) — repository structure and ownership
- [ARCHITECTURE.md](./ARCHITECTURE.md) — application layers and request boundaries
- [DATABASE.md](./DATABASE.md) — Prisma models, relationships, constraints, and enums
- [FEATURES.md](./FEATURES.md) — implemented, partial, and planned features
- [AUTH.md](./AUTH.md) — Clerk authentication and administrator authorization
- [FLOWS.md](./FLOWS.md) — catalog, image, checkout, payment, order, and tracking flows
- [API.md](./API.md) — important route handlers and server actions
- [SERVICES.md](./SERVICES.md) — business services and their responsibilities
- [INTEGRATIONS.md](./INTEGRATIONS.md) — Clerk, Cloudinary, Razorpay, AfterShip, and other external systems
- [bullmq.md](./bullmq.md) — BullMQ product-image queues, Render worker operations, retries, and scaling
- [SECURITY.md](./SECURITY.md) — trust boundaries, resource authorization, and secret handling
- [PERFORMANCE.md](./PERFORMANCE.md) — caching, concurrency, rate limiting, and known constraints
- [DEPLOYMENT.md](./DEPLOYMENT.md) — environment, migration, webhook, and production setup
- [DECISIONS.md](./DECISIONS.md) — architectural decisions that should remain intentional
- [ROADMAP.md](./ROADMAP.md) — prioritized future work and known gaps
- [AI/AI_RULES.md](./AI/AI_RULES.md) — mandatory rules for AI/code agents

## Documentation rule

Do not assume documentation is newer than the code.

When documentation and source code disagree:

1. Inspect the source code.
2. Determine the actual implementation.
3. Update the relevant documentation if necessary.

Never place real passwords, API keys, database URLs, webhook secrets, tokens, or private credentials in this directory.
