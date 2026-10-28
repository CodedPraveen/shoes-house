# Documentation update package — apply guide

## Scope

This archive is a focused documentation update for the approved customer-authentication removal and guest-checkout direction.

It is not a replacement for the entire project documentation set. It does not rewrite the architecture, project structure, deployment, Docker/VPS, Redis/BullMQ, image storage, performance, services, or other unrelated documents.

## Files included

- `docs/README.md` — adds the guest-checkout document to the documentation map and clarifies status rules.
- `docs/AUTH.md` — distinguishes the planned customer access model from the retained Clerk administrator authentication.
- `docs/GUEST_CHECKOUT.md` — new feature specification, token security requirements, migration direction, email plan, and acceptance checklist.
- `docs/API.md` — preserves current route/mobile API documentation and describes the planned order-access API migration.
- `docs/FEATURES.md` — preserves existing feature status and adds guest-checkout work as planned.
- `docs/FLOWS.md` — preserves image, payment, COD, storefront, and shipping flows; adds the planned guest flow.
- `docs/DATABASE.md` — preserves the current schema description and records the guest schema impact as planned.
- `docs/INTEGRATIONS.md` — preserves existing integrations and records Resend as selected but pending.
- `docs/SECURITY.md` — preserves existing security controls and adds future private-link requirements.
- `docs/DECISIONS.md` — preserves existing ADRs and adds the approved guest-checkout and Resend decisions.
- `docs/ROADMAP.md` — preserves existing roadmap items and adds targeted guest-checkout tasks.

## Safe application

1. Make a backup or commit of the current documentation before applying.
2. Extract this archive into the repository root, preserving the `docs/` folder structure.
3. Review the diff for each included file.
4. Do not replace any file that is not listed above.
5. Do not run Prisma migrations or change application code merely because this documentation package is applied.
6. Implement the feature separately, following `docs/GUEST_CHECKOUT.md`.
7. Update status from Planned to Implemented only after code review, migrations, tests, and production verification.

## Important implementation guardrails

- Clerk remains for administrators.
- Do not delete Clerk provider, middleware, administrator guards, or admin auth routes.
- Do not enable customer OTP.
- Do not fabricate customer users for guest orders.
- Preserve historical `Order.userId` values and order snapshots.
- Do not store raw private order tokens.
- Do not claim Resend is integrated until it is implemented and tested.
- Do not reset or truncate the production database.
