# Authentication and Authorization

## Definitions

Authentication proves who a user is. Authorization decides what an identity is allowed to access.

Clerk is the existing authentication provider. Server code performs authorization. The customer-authentication removal described below is a planned storefront change; it does not remove administrator authentication.

## Target customer access model

The approved customer experience is:

- Customers browse products and use the storefront without creating an account or signing in.
- Customer sign-in, sign-up, customer OTP login, and customer profile UI are not part of the target storefront experience.
- Customers submit checkout details as guests.
- Customers access an individual order through a high-entropy private order link. The order ID by itself is not proof of access.
- The private order link does not require an OTP. Possession of the unguessable token is the authorization capability; the token must be treated as a secret.
- Transactional order email is intended to deliver the private link. Resend has been selected as the initial email provider, but integration is pending.

**Implementation status:** The current `main` source still contains Clerk customer authentication and owner-authenticated order access. The current Prisma `Order.userId` and `CheckoutSession.userId` fields are required. Do not treat the target guest model as implemented until code and a production migration establish it.

## Clerk remains for administrators

Do not remove Clerk from the application, `ClerkProvider`, Clerk middleware, or server-side Clerk helpers as part of removing customer authentication. Existing administrator interfaces depend on them.

### Administrator authorization source

The existing `isAdminUser()` helper accepts either:

1. Clerk `publicMetadata.role === "admin"`, or
2. An email present in server-only `ADMIN_EMAILS`.

The Clerk webhook synchronizes the resulting role into the Prisma `User.role` field, but new-admin authorization uses the established server-side Clerk user check.

### New-admin page flow

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

### New-admin actions and APIs

- Product actions call `requireAdmin()`.
- New-admin order actions call `requireAdmin()`.
- CSV export calls `requireAdmin()` and returns 401 or 403.
- Shared order/invoice APIs currently authenticate first and then authorize the order owner or an administrator. The customer branch must be replaced with private-token authorization when guest order access is implemented; administrator access must remain.

### Existing admin

The `/admin` layout uses its established `currentUser()` and `isAdminUser()` behavior. Do not migrate or redesign it as part of the customer guest-checkout work.

## Mobile API caution

The repository documentation describes a separate Phase 2 mobile API surface that uses Clerk bearer sessions. Do not silently break or delete those endpoints as part of a storefront-only change. Before changing customer identity APIs, inspect the mobile application/repository and establish whether it still depends on them. Customer OTP routes must not be enabled as part of this work.

## Required administrator configuration

```env
ADMIN_URL=/new-admin
ADMIN_EMAILS=
```

Do not create `NEXT_PUBLIC_ADMIN_URL`. Do not use a client-visible secret or browser role for administrator authorization.
