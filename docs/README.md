# Post Mart — Project Documentation

> Technical documentation for the existing Post Mart ecommerce application. This documentation must be read alongside the source code; source code is the final authority for implementation status.

## Before changing the project

1. Read this file and [PROJECT.md](./PROJECT.md).
2. Read [STRUCTURE.md](./STRUCTURE.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).
3. Read the documents relevant to the requested feature.
4. Inspect the actual source code, Prisma schema, migrations, and environment template before editing.
5. Update only documentation affected by the code change. Do not rewrite unrelated architecture or operational documentation.

## Documentation map

- [PROJECT.md](./PROJECT.md) — project overview, stack, status, and commands
- [STRUCTURE.md](./STRUCTURE.md) — repository structure and ownership
- [ARCHITECTURE.md](./ARCHITECTURE.md) — application layers and request boundaries
- [DATABASE.md](./DATABASE.md) — Prisma models, relationships, constraints, and enums
- [FEATURES.md](./FEATURES.md) — implemented, partial, and planned features
- [AUTH.md](./AUTH.md) — Clerk authentication and administrator authorization
- [GUEST_CHECKOUT.md](./GUEST_CHECKOUT.md) — approved target behavior and implementation plan for guest checkout and private order access
- [FLOWS.md](./FLOWS.md) — catalog, image, checkout, payment, order, and tracking flows
- [API.md](./API.md) — important route handlers and server actions
- [SERVICES.md](./SERVICES.md) — business services and their responsibilities
- [INTEGRATIONS.md](./INTEGRATIONS.md) — Clerk, Razorpay, AfterShip, Redis, and other external systems
- [IMAGE_STORAGE.md](./IMAGE_STORAGE.md) — persistent paths, staging, Sharp conversion, metadata, and Docker mounts
- [bullmq.md](./bullmq.md) — BullMQ image jobs, worker operations, retries, and scaling
- [SECURITY.md](./SECURITY.md) — trust boundaries, resource authorization, and secret handling
- [PERFORMANCE.md](./PERFORMANCE.md) — caching, concurrency, rate limiting, and known constraints
- [DEPLOYMENT.md](./DEPLOYMENT.md) — environment, migration, webhook, and production setup
- [DECISIONS.md](./DECISIONS.md) — architectural decisions that should remain intentional
- [ROADMAP.md](./ROADMAP.md) — prioritized future work and known gaps
- [AI/AI_RULES.md](./AI/AI_RULES.md) — mandatory rules for AI/code agents

## Status language

- **Implemented** means verified in the current source tree.
- **Partial** means some code exists, but the complete user-facing or production workflow is not finished.
- **Planned** means a decision or design exists but the feature is not implemented.
- **Not verified** means source inspection alone cannot establish production behavior.

The guest-checkout documents describe a planned change unless and until the corresponding code, schema migration, tests, and production rollout are completed.

## Documentation rule

Do not assume documentation is newer than the code.

When documentation and source code disagree:

1. Inspect the source code and migrations.
2. Determine actual implementation and deployment status.
3. Correct only the affected documentation.
4. Preserve unrelated project-specific details.

Never place passwords, API keys, database URLs, webhook secrets, tokens, or private credentials in this directory.
