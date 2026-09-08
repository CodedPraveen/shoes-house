# Security

## Trust boundaries

- Client Components, browser state, request bodies, query strings, hidden fields, and public environment variables are untrusted.
- Clerk server APIs establish identity.
- Server-side role and ownership checks establish authorization.
- Third-party webhook signatures establish event authenticity.

## New-admin protection

- The shared layout calls `requireNewAdminPage()`.
- Every new-admin page also calls the guard before database/service work.
- Sensitive product and order Server Actions call `requireAdmin()` independently.
- CSV export independently returns 401 for logged-out callers and 403 for non-admin callers.
- Authenticated non-admin page requests use `notFound()` to avoid exposing the panel.

## IDOR prevention

For order detail and invoice resources:

1. Authenticate.
2. Validate the route ID.
3. Load the Clerk/Prisma identity and resource.
4. Require resource ownership or administrator authorization.
5. Only then perform tracking synchronization or invoice generation.

Never accept an arbitrary customer/admin `userId` when the server can derive it.

## Redirect safety

`ADMIN_URL` is normalized as a local path. Post-login destinations are restricted to that new-admin subtree. External redirect targets are not accepted.

## Product image safety

- New-admin accepts JPG and PNG files up to 10 MB each.
- File signatures and Sharp metadata are checked instead of trusting the browser MIME type or filename.
- Generated image IDs and validated entity IDs are the only values used to construct paths; arbitrary paths and original filenames are rejected.
- New records store controlled relative paths, never absolute VPS paths or pasted external URLs.
- Storefront lists exclude products containing missing or unsupported images; new-admin retains and reports those records for repair.
- `SafeImage` validates before rendering `next/image` and switches to a local fallback after remote request failure.
- Failed finalization removes staged inputs and only outputs created by that failed attempt.
- Historical Cloudinary URLs remain readable but are not accepted by the new upload path.

## Payments and inventory

- Razorpay signatures and captured status are verified server-side.
- Paid amounts must match the checkout session.
- Fulfillment is idempotent on payment/session identifiers.
- Paid stock decrement is atomic and records inventory movements.
- COD stock accounting remains a high-priority gap.

## Webhooks

- Clerk uses Svix verification.
- Razorpay uses its webhook signature.
- AfterShip uses HMAC verification.
- Never process a webhook body before required signature verification.

## Secrets

Never expose database URLs, `CLERK_SECRET_KEY`, Razorpay secrets, AfterShip secrets, Redis credentials, or server Google keys through `NEXT_PUBLIC_*`, browser code, logs, documentation, or API responses.

## Remaining concerns

- In-memory rate limiting is per process and insufficient as the only multi-region control.
- No automated E2E security suite was found.
- COD inventory accounting needs an atomic transaction.
- Product variant recreation can affect historical movement data and referenced variants.
