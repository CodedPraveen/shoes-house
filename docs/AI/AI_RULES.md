# AI Development Rules

These rules apply to AI assistants and code-generation agents working in this repository.

## Before changing code

- Read `docs/README.md` first.
- Read `docs/PROJECT.md`, `docs/STRUCTURE.md`, and `docs/ARCHITECTURE.md`.
- Read documentation relevant to the requested feature.
- Inspect the actual implementation before planning changes.
- Treat source code as the final source of truth.
- Preserve unrelated user changes in a dirty worktree.

## Reuse before creation

Before creating a service, helper, action, API, component, schema pattern, or integration layer:

1. Search the repository for an existing implementation.
2. Understand its callers and security boundary.
3. Reuse or safely extend it when appropriate.
4. Do not create duplicate business logic.

## Administrator systems

- `/admin` is the existing administrator system.
- `/new-admin` is the newer operations system.
- Do not modify `/admin` when working on `/new-admin` unless explicitly required.
- Shared backend changes must preserve established `/admin` behavior.
- Protect new-admin pages, route handlers, and Server Actions independently.

## Product images

- Product images use the existing Cloudinary service.
- Do not introduce pasted or arbitrary external product-image URLs in new-admin.
- Keep Cloudinary API secrets server-only.
- Preserve selected image order and existing edit images unless explicitly removed.
- Do not store local paths or blob URLs.

## Database

- Use Prisma through existing service/data-access boundaries.
- Do not duplicate Prisma business logic in UI components.
- Preserve soft-delete rules, order snapshots, ownership, idempotency, and inventory audit history.
- Use transactions for multi-model mutations.
- Do not run destructive migrations or data operations without explicit scope and verification.

## Authentication and authorization

- Authenticate and authorize protected operations server-side.
- Never trust client-provided `userId`, administrator role, hidden fields, localStorage, query parameters, or public environment variables.
- Derive identity from Clerk server APIs.
- Enforce resource ownership to prevent IDOR.
- A protected layout does not replace action, API, or close-to-resource page checks.

## UI

- Preserve existing UI unless the task explicitly requests a redesign.
- Keep mobile-first and responsive behavior.
- Follow existing naming, styling, route, and component conventions.
- Avoid adding large dependencies for functionality supported by the existing stack.

## Security

Never expose:

- passwords, tokens, or private keys;
- database credentials or connection URLs;
- Clerk, Cloudinary, Razorpay, AfterShip, Redis, or server Google secrets;
- webhook signing secrets;
- server-only environment values through `NEXT_PUBLIC_*`, logs, documentation, responses, or client bundles.

Verify webhook signatures before processing. Validate identifiers and inputs before resource operations. Return only fields required by the caller.

## Validation and handoff

- Run focused lint for changed files.
- Run the applicable build and tests.
- Report unrelated pre-existing failures separately.
- Do not claim live authentication, database, payment, upload, or webhook behavior was verified unless it was actually exercised.
- Update the relevant documentation when code changes make it stale.
