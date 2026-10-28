# Security

## Trust boundaries

- Client Components, browser state, request bodies, query strings, hidden fields, and public environment variables are untrusted.
- Clerk server APIs establish the current authenticated identity.
- Server-side role and ownership checks establish administrator/current customer authorization.
- Third-party webhook signatures establish event authenticity.
- Guest order access, once implemented, must be established by a high-entropy private token, never by an order ID or email address alone.

## New-admin protection

- The shared layout calls `requireNewAdminPage()`.
- Every new-admin page also calls the guard before database/service work.
- Sensitive product and order Server Actions call `requireAdmin()` independently.
- CSV export independently returns 401 for logged-out callers and 403 for non-admin callers.
- Authenticated non-admin page requests use `notFound()` to avoid exposing the panel.

## IDOR prevention — current implementation

For current order detail and invoice resources:

1. Authenticate.
2. Validate the route ID.
3. Load the Clerk/Prisma identity and resource.
4. Require resource ownership or administrator authorization.
5. Only then perform tracking synchronization or invoice generation.

Never accept an arbitrary customer/admin `userId` when the server can derive it.

## Guest private-order access — planned requirements

The target customer model does not use customer login or OTP. It uses a secret order-access link.

- Generate at least 256 bits of cryptographically secure randomness.
- Persist only a one-way token hash; never store or log the raw token.
- An order ID, order number, email, phone number, or shipping postcode alone must not authorize order access.
- Compare token material safely and rate-limit attempts.
- Define token expiry, revocation, and rotation before launch.
- Use HTTPS and prevent token leakage through referrers, analytics, logs, third-party assets, and error reporting.
- Return private/no-store responses; do not cache private order data in shared caches.
- Return generic failure responses that do not disclose whether an order or token exists.
- Keep admin access separate and protected by Clerk plus server-side admin authorization.

These are requirements for future implementation, not a statement that token protection exists today.

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
- Guest checkout must preserve payment and inventory invariants.

## Webhooks

- Clerk uses Svix verification.
- Razorpay uses its webhook signature.
- AfterShip uses HMAC verification.
- Never process a webhook body before required signature verification.

## Secrets

Never expose database URLs, `CLERK_SECRET_KEY`, Razorpay secrets, AfterShip secrets, Redis credentials, Resend API keys, or server Google keys through `NEXT_PUBLIC_*`, browser code, logs, documentation, or API responses.

## Remaining concerns

- In-memory rate limiting is per process and insufficient as the only multi-instance control.
- No automated E2E security suite was found.
- COD inventory accounting needs an atomic transaction.
- Product variant recreation can affect historical movement data and referenced variants.
- Guest order token lifecycle, abuse controls, and email delivery retries must be tested before production.
