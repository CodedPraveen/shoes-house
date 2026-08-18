# Authentication and Authorization

## Definitions

Authentication proves who a user is. Authorization decides what that user is allowed to access.

Clerk provides authentication. Server code performs authorization.

## Customer authentication

- `ClerkProvider` is configured in `providers/app-providers.js` when the public Clerk key exists.
- Sign-in and sign-up routes live under `app/(auth)/`.
- Customer Server Actions use `auth()`, `currentUser()`, or `requireDbUser()` as appropriate.
- Sensitive customer identity is derived from Clerk server APIs, not request bodies.

## Administrator authorization source

The existing `isAdminUser()` helper accepts either:

1. Clerk `publicMetadata.role === "admin"`, or
2. An email present in server-only `ADMIN_EMAILS`.

The Clerk webhook synchronizes the resulting role into the Prisma `User.role` field, but new-admin authorization uses the established server-side Clerk user check.

## New-admin page flow

```text
/new-admin/*
  → requireNewAdminPage()
  → Clerk auth()
  → unauthenticated: safe redirect to /sign-in
  → authenticated non-admin: notFound()
  → authenticated admin: render
```

The destination is limited to the normalized local new-admin subtree. `ADMIN_URL` is a route path only and is never an authorization mechanism.

Every new-admin page calls the guard before service or Prisma access. The shared layout also calls it. This duplication is intentional because App Router layouts and pages can begin rendering in parallel; `React.cache()` deduplicates the underlying authorization work per request.

## New-admin actions and APIs

- Product actions call `requireAdmin()`.
- New-admin order actions call `requireAdmin()`.
- CSV export calls `requireAdmin()` and returns 401 or 403.
- Shared order/invoice APIs authenticate first and then authorize the order owner or an administrator.

## Existing admin

The `/admin` layout uses its established `currentUser()` and `isAdminUser()` behavior. Do not migrate or redesign it as part of new-admin work.

## Required configuration

```env
ADMIN_URL=/new-admin
```

Do not create `NEXT_PUBLIC_ADMIN_URL`. Do not use a client-visible secret or browser role for administrator authorization.
