# Docker workflow

This setup runs the production Next.js application, the existing BullMQ worker, and Redis as separate services. PostgreSQL remains on Supabase; Docker does not create or migrate a database.

## Prerequisites

- Docker Desktop with Docker Compose
- A project-root `.env` containing the application's real local credentials. Start from `.env.example`; never commit `.env`.
- Reachable Supabase PostgreSQL values for `DATABASE_URL` and `DIRECT_URL`

The worker validates `DATABASE_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` at startup. The application also needs its existing Clerk, Cloudinary, payment, shipping, and Google variables for the features you exercise. Compose overrides only `REDIS_URL` so both Node.js services use the internal Redis service.

## Start and stop

Build and start all services:

```sh
docker compose up --build
```

Run them in the background:

```sh
docker compose up --build -d
```

Open the application at <http://localhost:3000>.

View logs:

```sh
docker compose logs -f nextjs worker redis
```

Stop the services while retaining Redis data:

```sh
docker compose down
```

Rebuild after dependency or source changes:

```sh
docker compose build --no-cache
docker compose up -d
```

Redis data is stored in the named `redis-data` volume. `docker compose down -v` also deletes that local queue data, so use it only when a reset is intentional.

## Networking

Compose provides an internal network. Both `nextjs` and `worker` receive `REDIS_URL=redis://redis:6379`, where `redis` is Docker's service name. Redis is not published to the host. A Redis healthcheck gates the two Node.js services so they do not start before Redis is ready.

The image build uses the committed npm lockfile, generates Prisma Client through the existing npm scripts, and builds Next.js in production mode. Some existing pages query Prisma while Next.js prerenders them, so Compose provides `.env` to that single build step as an ephemeral BuildKit secret. The file is excluded from the build context and is not copied into an image layer. Any `NEXT_PUBLIC_*` value used by Next.js is still compiled into browser assets by Next.js's normal behavior and therefore must not be a secret.

Because prerendering reads existing application data, the database and Redis endpoints in `.env` must be reachable from the Docker build environment. Container startup does not run Prisma migrations, `db push`, seeding, or other database mutations.

## Run without Docker

The host development workflow is unchanged. Use `.env.local` with `REDIS_URL=redis://localhost:6379` and a host-accessible Redis instance, then run:

```sh
npm ci
npm run dev
```

You can also run the processes separately with `npm run dev:next` and `npm run worker`.
