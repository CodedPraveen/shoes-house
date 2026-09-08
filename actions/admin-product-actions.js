"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { productAdminService } from "@/services/product-admin-service";
import { imageUploadService } from "@/services/upload/image-upload-service";
import { clearProductCache } from "@/lib/product-cache";
import { enqueueProductImages, retryProductImages } from "@/queues";
import { formatZodError, productCreationInputSchema } from "@/schemas/product.schema";
import { imageIdFromStagingUrl, isStagingImageUrl } from "@/lib/image-storage";
import { productImageSource } from "@/lib/mappers/product-mapper";

function productImageJobPayload(productId, orderedSources, existingImages = []) {
  const existingBySource = new Map(existingImages.map((image) => [productImageSource(image), image.id]));
  const images = [];
  const retainedImages = [];

  orderedSources.forEach((source, sortOrder) => {
    const imageId = imageIdFromStagingUrl(source);
    if (imageId) {
      images.push({ imageId, sortOrder });
      return;
    }
    const existingId = existingBySource.get(source);
    if (!existingId) throw new Error("Product image reference is not a staged or existing image.");
    retainedImages.push({ imageId: existingId, sortOrder });
  });

  return { productId, images, retainedImages, stagingRecord: orderedSources };
}

async function revalidateProductPaths(slug) {
  await clearProductCache(slug);
  revalidateTag("products", "max");
  revalidateTag("search-catalog", "max");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  if (slug) {
    revalidatePath(`/shoes/product/${slug}`);
    revalidatePath(`/jewellery/product/${slug}`);
  }
}

export async function getAdminCategoriesAction() {
  await requireAdmin();
  return productAdminService.listCategories();
}

export async function getAdminProductForEditAction(id) {
  await requireAdmin();
  return productAdminService.getForEdit(id);
}

export async function createProductAction(input) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-create", limit: 20, windowMs: 60_000 });
  const validation = productCreationInputSchema.safeParse(input);
  if (!validation.success) {

    console.error("[PRODUCT CREATE] validation failed", validation.error);

    return { ok: false, error: formatZodError(validation.error) };
  }
  if (!validation.data.imageUrls.every(isStagingImageUrl)) {
    return { ok: false, error: "New product images must be uploaded from this device." };
  }
  const product = await productAdminService.createProcessing(validation.data);
  
  let job;
  try {
 
    job = await enqueueProductImages({
      productId: product.id,
      ...productImageJobPayload(product.id, validation.data.imageUrls),
    });

    await productAdminService.setProcessingJobId(product.id, job.id);
  } catch (error) {
    console.error("[PRODUCT CREATE] enqueue FAILED", {
      productId: product.id,
      error: error?.message,
      stack: error?.stack,
    });
    await productAdminService.markProcessingFailed(
      product.id,
      "Image processing could not be queued. Retry after Redis is available.",
    );
    console.error(JSON.stringify({
      service: "product-create",
      event: "enqueue-failed",
      productId: product.id,
      error: error?.message || "Queue unavailable",
    }));
    return {
      ok: false,
      productId: product.id,
      error: "The product was saved as failed because image processing could not be queued.",
    };
  }
  await revalidateProductPaths(product.slug);

  return {
    ok: true,
    queued: true,
    jobId: job.id,
    product,
    message: "Product created — processing images.",
  };
}

export async function retryProductImageProcessingAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-image-retry", limit: 20, windowMs: 60_000 });

  const productId = String(formData.get("productId") || "");
  const state = await productAdminService.getProcessingState(productId);
  if (!state) return { ok: false, error: "Product not found." };
  if (state.processingStatus === "READY") return { ok: true, message: "Product is already ready." };
  if (!state.pendingImageUrls.length) return { ok: false, error: "No staged image references are available." };

  try {
    const payload = productImageJobPayload(productId, state.pendingImageUrls, state.images);
    const job = await retryProductImages(payload, state.processingJobId);
    await productAdminService.markProcessingQueued(productId, job.id);
    revalidatePath("/new-admin/products");
    revalidatePath("/admin/products");
    return { ok: true, message: "Image processing was queued again." };
  } catch {
    await productAdminService.markProcessingFailed(
      productId,
      "Image processing could not be re-queued. Retry after Redis is available.",
    );
    return { ok: false, error: "Image processing could not be re-queued." };
  }
}

export async function updateProductAction(id, input) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-update", limit: 30, windowMs: 60_000 });

  const validation = productCreationInputSchema.safeParse(input);
  if (!validation.success) return { ok: false, error: formatZodError(validation.error) };

  const existing = await productAdminService.getForEdit(id);
  if (!existing) return { ok: false, error: "Product not found." };
  const existingSources = new Set(existing.imageRecords.map(productImageSource));
  const invalidSource = validation.data.imageUrls.find(
    (source) => !isStagingImageUrl(source) && !existingSources.has(source),
  );
  if (invalidSource) return { ok: false, error: "Product images must be existing images or new device uploads." };

  const stagedSources = validation.data.imageUrls.filter(isStagingImageUrl);
  const retainedSources = validation.data.imageUrls.filter((source) => !isStagingImageUrl(source));
  const product = await productAdminService.update(
    id,
    { ...validation.data, imageUrls: retainedSources },
    { allowEmptyImages: stagedSources.length > 0 },
  );

  if (stagedSources.length) {
    const payload = productImageJobPayload(id, validation.data.imageUrls, existing.imageRecords);
    await productAdminService.beginImageProcessing(id, validation.data.imageUrls);
    try {
      const job = await enqueueProductImages(payload);
      await productAdminService.setProcessingJobId(id, job.id);
    } catch (error) {
      await productAdminService.markProcessingFailed(id, "Image processing could not be queued.");
      return { ok: false, productId: id, error: "Product changes were saved, but image processing could not be queued." };
    }
  }
  await revalidateProductPaths(product.slug);
  return { ok: true, product, queued: stagedSources.length > 0 };
}

export async function deleteProductAction(id) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-delete", limit: 15, windowMs: 60_000 });

  const existing = await productAdminService.getForEdit(id);
  await productAdminService.softDelete(id);
  await revalidateProductPaths(existing?.slug);
  return { ok: true };
}

export async function getSubCategoriesAction(collection) {
  await requireAdmin();

  return productAdminService.listSubCategories(collection);
}

export async function uploadProductImageAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-upload", limit: 40, windowMs: 60_000 });

  const file = formData.get("file");
  const result = await imageUploadService.uploadFile(file);

  if (!result.ok) {
    return { ok: false, error: result.message || "Upload failed" };
  }

  return { ok: true, url: result.url, imageId: result.imageId };
}

export async function uploadNewAdminProductImageAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "new-admin-upload", limit: 40, windowMs: 60_000 });

  const file = formData.get("file");
  const supportedTypes = new Set(["image/jpeg", "image/png"]);
  if (!file || !supportedTypes.has(file.type)) {
    return { ok: false, error: "Choose a JPG or PNG image." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Each product image must be 10 MB or smaller." };
  }
  const collection = String(formData.get("collection") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const category = await productAdminService.getUploadCategory(collection, categorySlug);
  if (!category) return { ok: false, error: "Choose a valid collection and category before uploading." };
  const result = await imageUploadService.uploadFile(file);

  if (!result.ok) {
    return { ok: false, error: result.message || "Upload failed" };
  }

  return { ok: true, url: result.url, imageId: result.imageId };
}

export async function discardProductImageUploadsAction(references) {
  await requireAdmin();
  const ids = Array.from(references || [])
    .filter(isStagingImageUrl)
    .slice(0, 40);
  await Promise.allSettled(ids.map((reference) => imageUploadService.delete(reference)));
  return { ok: true };
}
