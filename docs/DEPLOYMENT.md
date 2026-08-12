# Development and Deployment

## Local setup

```bash
npm install
# Create a local .env using an example as a guide.
# Fill values locally; never commit real credentials.
npm run setup
npm run dev
```

`npm run setup` performs Prisma generation, development schema push, and seed execution.

## Database commands

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:deploy
npm run db:seed
npm run db:studio
```

- Use `db:push` only for development synchronization.
- Create and review migrations with `db:migrate`.
- Apply committed production migrations with `db:deploy`.

## Validation commands

```bash
npm run lint
npm run build
```

The build script generates Prisma Client before the Next.js build. On Windows, a running process can lock Prisma's query-engine DLL; stop processes using the generated client before regenerating it.

## Expected production topology

```text
Git repository
  → Vercel build/runtime
  → Supabase PostgreSQL
  → Clerk
  → Cloudinary
  → Razorpay
  → AfterShip
  → Redis when configured
```

The actual deployed topology must be verified in the hosting project.

## Environment variables

### Application/public

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Clerk public sign-in/sign-up/redirect paths
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- Public Google Maps variables
- `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`

### Server-only

- `DATABASE_URL`, `DIRECT_URL`
- `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `ADMIN_EMAILS`, `ADMIN_URL`
- Cloudinary server variables
- Razorpay server variables
- AfterShip server variables
- Server Google variables
- `REDIS_URL`, `PERF_LOG`

Required new-admin path:

```env
ADMIN_URL=/new-admin
```

## Webhook setup

Register production endpoints for:

- `/api/webhooks/clerk`
- `/api/webhooks/razorpay`
- `/api/webhooks/aftership`

Configure the corresponding signing secrets in the deployment environment. Test invalid signatures and duplicate delivery behavior before launch.

## Release checklist

- Apply migrations before serving code that depends on them.
- Verify Clerk roles and both administrator experiences.
- Verify one-image and multi-image Cloudinary uploads.
- Verify Razorpay test and production modes are not mixed.
- Verify AfterShip carrier/webhook configuration.
- Run owner/non-owner order access tests.
- Confirm secrets are not included in client bundles or logs.
