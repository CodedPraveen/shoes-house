# BullMQ Image Worker

The `product-image-processing` queue handles product and hero-banner image finalization.

## Flow

```text
Admin JPG/PNG upload
  → authenticated action validates/stages
  → Redis/BullMQ
  → worker validates staged content
  → Sharp WebP conversion
  → persistent image volume
  → database metadata finalization
  → staged file cleanup
```

## Responsibilities

- `queues/image.queue.js`: shared queue and retry policy.
- `queues/product.queue.js`: validated job submission/retry.
- `schemas/queue.schema.js`: job payload validation.
- `workers/product.worker.js`: worker lifecycle and failure handling.
- `workers/image.worker.js`: Sharp conversion and database finalization.
- `lib/image-storage.js`: generated IDs and safe paths.

## Configuration

```text
DATABASE_URL
REDIS_URL
IMAGE_STORAGE_ROOT=/data/ecommerce/images
```

Optional tuning variables are defined by the worker implementation. Next.js and worker must mount the same persistent volume.

## Operations

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs -f worker
```

Verify conversion, dimensions, metadata, cleanup, public serving, and persistence after container recreation. Historical Cloudinary URLs are read-only compatibility.
