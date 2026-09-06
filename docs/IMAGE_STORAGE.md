# Persistent image storage

New product and hero-banner uploads use the VPS filesystem rather than an external image provider.

## Storage layout

`IMAGE_STORAGE_ROOT` is `/data/ecommerce/images` in Docker and defaults to `.data/images` for host development.

```text
staging/{imageId}.upload
products/{productId}/{imageId}.webp
categories/{categoryId}/{imageId}.webp
banners/{bannerId}/{imageId}.webp
```

The database stores relative `storagePath` values, dimensions, ordering, and ownership metadata. It never stores `/data/ecommerce/images` as part of a new image record. Existing Cloudinary URLs remain readable for historical records only.

## Processing flow

1. An authenticated admin uploads a JPG or PNG of at most 10 MB.
2. Next.js validates the declared type and file signature, generates an `i_...` image ID, and writes a private staging file.
3. The existing BullMQ queue sends the controlled image ID and entity metadata to the worker.
4. Sharp inspects the actual content and converts it to WebP at quality 82 without a resize operation.
5. The worker verifies that output width and height equal the input dimensions, atomically moves the output into its permanent directory, and commits relative metadata to Supabase.
6. Only after successful database finalization does the worker delete the staged original.

On a final job failure, the worker marks product processing as failed where applicable and removes staged/partial files. Generated IDs and database upserts make product retries idempotent. Historical Cloudinary data is not migrated by this change.

## Docker and local development

Compose mounts the named `image-data` volume into both `nextjs` and `worker` at `/data/ecommerce/images`. The volume survives ordinary container recreation and `docker compose down`; `docker compose down -v` intentionally removes it.

For host development, set `IMAGE_STORAGE_ROOT=.data/images` or omit it to use that default. Ensure Next.js and the worker use the same working directory/root. New files are served through `/images/...` by a Node.js route until Nginx takes over that path in deployment.
