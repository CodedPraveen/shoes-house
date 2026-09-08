# BullMQ Image Worker

The existing `product-image-processing` queue handles both product and hero-banner image finalization. Next.js only validates and stages uploads, writes processing state, and enqueues jobs. The long-lived worker performs image conversion and database finalization.

## Flow

```text
Admin JPG/PNG upload
  → authenticated Server Action
  → /data/ecommerce/images/staging/{imageId}.upload
  → Product(PROCESSING) or pending banner payload
  → Redis/BullMQ product-image-processing
  → worker validates the job and staged content
  → Sharp WebP conversion without resize
  → atomic rename into products/ or banners/
  → database metadata transaction
  → staged-original deletion
```

Product jobs persist `ProductImage.storagePath`, `width`, `height`, and ordering, then set the product to `READY`. Banner jobs persist the same metadata in `MediaAsset` and create or update the related `HeroSlide`. Database paths are relative and map to `/images/...` when served.

## Queue and worker files

- `queues/image.queue.js` defines the shared queue and retry policy.
- `queues/product.queue.js` validates and submits product/banner jobs and provides product retry behavior.
- `schemas/queue.schema.js` validates job payloads and worker configuration.
- `workers/product.worker.js` owns BullMQ lifecycle logging, final failure status, and graceful cleanup.
- `workers/image.worker.js` owns Sharp conversion, idempotent finalization, and entity-specific transactions.
- `lib/image-storage.js` owns generated image IDs and validated staging/permanent paths.

## Retry and failure behavior

Jobs default to three attempts with exponential backoff. Permanent input problems use `UnrecoverableError`, including invalid payloads, missing/deleted entities, staging-reference mismatches, missing files, corrupt content, and unsupported formats.

Conversion writes to a process-specific temporary path. Only a valid WebP with unchanged dimensions is atomically renamed to the final path. A failing attempt removes its own temporary/output files. Final failure removes staged inputs and marks a non-ready product `FAILED`; it does not remove a valid permanent file created by an earlier attempt.

If a finalized product job is delivered again, the worker removes any redundant staging reference and returns `already-ready`. Existing valid WebP output can also be reused during a database-finalization retry. Database writes use transactions and deterministic image IDs to prevent duplicate rows.

## Configuration

The worker requires:

```text
DATABASE_URL
REDIS_URL
IMAGE_STORAGE_ROOT=/data/ecommerce/images
```

Optional tuning variables:

```text
BULLMQ_WORKER_CONCURRENCY
BULLMQ_WORKER_RATE_MAX
BULLMQ_WORKER_RATE_DURATION_MS
BULLMQ_REDIS_CONNECT_TIMEOUT_MS
```

Docker Compose mounts the same persistent `image-data` volume at `IMAGE_STORAGE_ROOT` in Next.js and the worker. Redis uses its existing persistent volume. Do not place images in Docker build layers or process them in the Next.js runtime.

## Operations

```bash
docker compose config --quiet
docker compose up --build -d
docker compose ps
docker compose logs -f worker
```

Healthy worker logs include a `started` event, then `active`, `completed`, or explicit `failed` events with job and entity IDs. A stopped worker leaves queued work in Redis; restarting it resumes consumption.

For verification, submit a real staged JPG/PNG through BullMQ and confirm all of the following: the output is WebP, dimensions are unchanged, metadata is committed, the source is removed, `/images/...` serves the file, and the file survives container recreation. Use isolated records and remove them after testing.

Historical Cloudinary URLs remain readable for existing records only. Cloudinary credentials and asset verification are not part of this queue or worker.
