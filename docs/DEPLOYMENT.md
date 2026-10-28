# Development and Deployment

## Local setup

```bash
npm install
npm run setup
npm run dev
```

Use `.env.example` as the environment reference. Never commit real values.

## Database

```bash
npm run db:generate
npm run db:push       # development only
npm run db:migrate    # create/review migration
npm run db:deploy     # apply committed migrations
npm run db:seed
npm run db:studio
```

Guest-order schema changes must be additive and tested against a copy of existing data before production rollout. Never reset production data.

## Validation

```bash
npm run lint
npm run build
```

## Expected application topology

```text
Next.js application
  ├─ guest storefront and checkout
  ├─ Clerk-protected admin systems
  └─ API routes/webhooks
BullMQ worker + Redis
Shared persistent image volume
PostgreSQL/Supabase
Razorpay
AfterShip
Resend (when implemented)
```

Verify the actual production topology in the hosting provider before release; repository configuration alone does not prove deployment state.

## Environment groups

### Application
- `NEXT_PUBLIC_APP_URL`
- Existing public analytics/maps variables as required.

### Clerk — administrator authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `ADMIN_EMAILS`
- `ADMIN_URL`

Do not remove Clerk variables while admin routes depend on them.

### Database
- `DATABASE_URL`
- `DIRECT_URL`

### Payments
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

### Tracking
- `AFTERSHIP_API_KEY`
- `AFTERSHIP_WEBHOOK_SECRET`

### Redis/images
- `REDIS_URL`
- `IMAGE_STORAGE_ROOT`
- Existing BullMQ tuning variables where configured.

### Resend — add only when integration is implemented
```env
RESEND_API_KEY=
EMAIL_FROM=
```

`EMAIL_FROM` must use a sender/domain verified with Resend. The API key is server-only.

## Webhooks

Retain the endpoints and signing secrets required by active Clerk admin sync, Razorpay and AfterShip integrations. Verify invalid signatures and duplicate deliveries before release.

## Release checklist

- Apply migrations before deploying code that requires them.
- Confirm both admin systems still authenticate and authorize correctly.
- Test guest CART and BUY_NOW.
- Test COD stock behavior and Razorpay payment/webhook idempotency.
- Test order access with valid, invalid, expired/revoked and cross-order tokens.
- Confirm order ID alone reveals no customer data.
- Verify Resend sender domain and real delivery when enabled.
- Verify worker, Redis and persistent image volume.
- Confirm no secrets or raw order tokens appear in client bundles/logs.
