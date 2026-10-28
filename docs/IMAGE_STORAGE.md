# Persistent Image Storage

New product and hero-banner uploads use the persistent filesystem rather than an external image provider.

## Storage

`IMAGE_STORAGE_ROOT` is `/data/ecommerce/images` in Docker and defaults to `.data/images` for host development.

```text
staging/{imageId}.upload
products/{productId}/{imageId}.webp
categories/{categoryId}/{imageId}.webp
banners/{bannerId}/{imageId}.webp
```

Database records store relative `storagePath` values and image metadata, not absolute VPS paths. Historical Cloudinary URLs remain readable for legacy records only.

## Processing

1. Admin uploads a JPG/PNG.
2. Server validates content and writes a generated staging file.
3. BullMQ submits a controlled job.
4. Worker uses Sharp to inspect and convert to WebP.
5. Worker writes permanent output and commits metadata.
6. Staging source is removed after successful finalization.

Next.js and worker containers must share the same persistent volume. Do not place uploaded files in Docker image layers.
