import { mkdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { UnrecoverableError } from "bullmq";
import sharp from "sharp";
import { prisma } from "../lib/db.js";
import {
  buildImageStoragePath,
  removeStagedImage,
  removeStoredImage,
  resolveImageStoragePath,
  resolveStagingPath,
} from "../lib/image-storage.js";
import { imageJobSchema } from "../schemas/queue.schema.js";

async function existingWebp(storagePath) {
  try {
    await stat(resolveImageStoragePath(storagePath));
    const metadata = await sharp(resolveImageStoragePath(storagePath)).metadata();
    if (metadata.format !== "webp" || !metadata.width || !metadata.height) return null;
    return { storagePath, width: metadata.width, height: metadata.height };
  } catch {
    return null;
  }
}

async function convertStagedImage(kind, entityId, imageId) {
  const storagePath = buildImageStoragePath(kind, entityId, imageId);
  const existing = await existingWebp(storagePath);
  if (existing) return { ...existing, created: false };

  const sourcePath = resolveStagingPath(imageId);
  try {
    await stat(sourcePath);
  } catch {
    throw new UnrecoverableError(`Staged source file is missing for ${imageId}`);
  }

  let metadata;
  try {
    metadata = await sharp(sourcePath, { failOn: "error" }).metadata();
  } catch (error) {
    throw new UnrecoverableError(`Invalid image content for ${imageId}: ${error.message}`);
  }
  if (!new Set(["jpeg", "png"]).has(metadata.format)) {
    throw new UnrecoverableError(`Unsupported input type for ${imageId}: ${metadata.format || "unknown"}`);
  }

  const outputPath = resolveImageStoragePath(storagePath);
  const temporaryOutputPath = `${outputPath}.${process.pid}.tmp`;
  await mkdir(path.dirname(outputPath), { recursive: true });

  try {
    const info = await sharp(sourcePath, { failOn: "error" })
      .webp({ quality: 82 })
      .toFile(temporaryOutputPath);
    if (info.format !== "webp" || info.width !== metadata.width || info.height !== metadata.height) {
      throw new Error("Sharp changed the image dimensions or returned an invalid format");
    }
    await rename(temporaryOutputPath, outputPath);
    return { storagePath, width: info.width, height: info.height, created: true };
  } catch (error) {
    await rm(temporaryOutputPath, { force: true }).catch(() => {});
    await removeStoredImage(storagePath).catch(() => {});
    throw error;
  }
}

async function cleanupStaged(images) {
  await Promise.allSettled(images.map((image) => removeStagedImage(image.imageId)));
}

async function processProductImageJob(data) {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { id: true, deletedAt: true, processingStatus: true, pendingImageUrls: true },
  });
  if (!product || product.deletedAt) throw new UnrecoverableError("Product no longer exists");

  if (product.processingStatus === "READY") {
    await cleanupStaged(data.images);
    return { productId: data.productId, skipped: true, reason: "already-ready" };
  }
  if (
    product.pendingImageUrls.length !== data.stagingRecord.length ||
    product.pendingImageUrls.some((value, index) => value !== data.stagingRecord[index])
  ) {
    throw new UnrecoverableError("Queued image references do not match the product staging record");
  }

  const converted = [];
  try {
    for (const image of data.images) {
      converted.push({
        imageId: image.imageId,
        sortOrder: image.sortOrder,
        ...(await convertStagedImage("products", data.productId, image.imageId)),
      });
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: data.productId },
        select: { deletedAt: true, processingStatus: true },
      });
      if (!current || current.deletedAt) throw new UnrecoverableError("Product was deleted while processing");
      if (current.processingStatus === "READY") return;

      for (const retained of data.retainedImages) {
        const updated = await tx.productImage.updateMany({
          where: { id: retained.imageId, productId: data.productId, deletedAt: null },
          data: { sortOrder: retained.sortOrder, isHover: retained.sortOrder === 1 },
        });
        if (updated.count !== 1) throw new UnrecoverableError("A retained product image no longer exists");
      }

      for (const image of converted) {
        await tx.productImage.upsert({
          where: { id: image.imageId },
          create: {
            id: image.imageId,
            productId: data.productId,
            url: null,
            storagePath: image.storagePath,
            width: image.width,
            height: image.height,
            sortOrder: image.sortOrder,
            isHover: image.sortOrder === 1,
          },
          update: {
            storagePath: image.storagePath,
            width: image.width,
            height: image.height,
            sortOrder: image.sortOrder,
            isHover: image.sortOrder === 1,
            deletedAt: null,
          },
        });
      }

      const expectedCount = data.retainedImages.length + converted.length;
      const imageCount = await tx.productImage.count({ where: { productId: data.productId, deletedAt: null } });
      if (imageCount !== expectedCount) throw new UnrecoverableError("Product image finalization was incomplete");

      await tx.product.update({
        where: { id: data.productId },
        data: {
          processingStatus: "READY",
          processingError: null,
          processedAt: new Date(),
          pendingImageUrls: [],
        },
      });
    });
  } catch (error) {
    await Promise.allSettled(
      converted.filter((image) => image.created).map((image) => removeStoredImage(image.storagePath)),
    );
    throw error;
  }

  await cleanupStaged(data.images);
  return { productId: data.productId, imageCount: converted.length + data.retainedImages.length };
}

async function processBannerImageJob(data) {
  const current = await prisma.heroSlide.findUnique({
    where: { id: data.bannerId },
    include: { mediaAsset: true },
  });
  const expectedPath = buildImageStoragePath("banners", data.bannerId, data.image.imageId);
  if (current?.mediaAssetId === data.mediaAssetId && current.mediaAsset.storagePath === expectedPath) {
    await cleanupStaged([data.image]);
    return { bannerId: data.bannerId, skipped: true, reason: "already-ready" };
  }
  if (data.create && current) throw new UnrecoverableError("Banner ID is already in use");
  if (!data.create && !current) throw new UnrecoverableError("Banner no longer exists");

  const converted = await convertStagedImage("banners", data.bannerId, data.image.imageId);
  try {
    await prisma.$transaction(async (tx) => {
      if (data.data.targetType === "CATEGORY" && data.data.categoryId) {
        const category = await tx.category.findFirst({ where: { id: data.data.categoryId, deletedAt: null }, select: { id: true } });
        if (!category) throw new UnrecoverableError("Banner category no longer exists");
      }
      if (data.data.targetType === "PRODUCT" && data.data.productId) {
        const product = await tx.product.findFirst({ where: { id: data.data.productId, deletedAt: null }, select: { id: true } });
        if (!product) throw new UnrecoverableError("Banner product no longer exists");
      }

      await tx.mediaAsset.create({
        data: {
          id: data.mediaAssetId,
          url: null,
          storagePath: converted.storagePath,
          width: converted.width,
          height: converted.height,
          folder: "banners",
          alt: data.data.alt,
        },
      });
      if (data.create) {
        await tx.heroSlide.create({
          data: { id: data.bannerId, mediaAssetId: data.mediaAssetId, ...data.data },
        });
      } else {
        const updated = await tx.heroSlide.updateMany({
          where: { id: data.bannerId, collection: data.data.collection },
          data: { mediaAssetId: data.mediaAssetId, ...data.data },
        });
        if (updated.count !== 1) throw new UnrecoverableError("Banner no longer exists");
      }
    });
  } catch (error) {
    if (converted.created) await removeStoredImage(converted.storagePath).catch(() => {});
    throw error;
  }

  await cleanupStaged([data.image]);
  return { bannerId: data.bannerId, storagePath: converted.storagePath };
}

export async function processImageJob(job) {
  const parsed = imageJobSchema.safeParse(job.data);
  if (!parsed.success) throw new UnrecoverableError("Invalid image job payload");
  return parsed.data.type === "banner"
    ? processBannerImageJob(parsed.data)
    : processProductImageJob(parsed.data);
}

export async function cleanupFailedImageJob(data) {
  const parsed = imageJobSchema.safeParse(data);
  if (!parsed.success) return;
  const images = parsed.data.type === "banner" ? [parsed.data.image] : parsed.data.images;
  await cleanupStaged(images);
}
