"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { productAdminService } from "@/services/product-admin-service";
import { imageUploadService } from "@/services/upload/image-upload-service";
import { clearProductCache } from "@/lib/product-cache";
import { enqueueProductImages, retryProductImages } from "@/queues";
import { formatZodError, productCreationInputSchema } from "@/schemas/product.schema";

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
    return { ok: false, error: formatZodError(validation.error) };
  }

  const product = await productAdminService.createProcessing(validation.data);

  let job;
  try {
    job = await enqueueProductImages({
      productId: product.id,
      images: validation.data.imageUrls.map((url) => ({ url })),
    });
    await productAdminService.setProcessingJobId(product.id, job.id);
  } catch (error) {
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
    const job = await retryProductImages({
      productId,
      images: state.pendingImageUrls.map((url) => ({ url })),
    });
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

  const product = await productAdminService.update(id, input);
  await revalidateProductPaths(product.slug);
  return { ok: true, product };
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
  const result = await imageUploadService.uploadFile(file, {
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "postmart/products",
  });

  if (!result.ok) {
    return { ok: false, error: result.message || "Upload failed" };
  }

  return { ok: true, url: result.url, publicId: result.publicId };
}

export async function uploadNewAdminProductImageAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "new-admin-upload", limit: 40, windowMs: 60_000 });

  const file = formData.get("file");
  const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!file || !supportedTypes.has(file.type)) {
    return { ok: false, error: "Choose a JPG, PNG, or WEBP image." };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: "Each product image must be 10 MB or smaller." };
  }
  const collection = String(formData.get("collection") ?? "");
  const categorySlug = String(formData.get("categorySlug") ?? "");
  const category = await productAdminService.getUploadCategory(collection, categorySlug);
  if (!category) return { ok: false, error: "Choose a valid collection and category before uploading." };
  const folder = `postmart/${category.collection.toLowerCase()}/${category.slug.toLowerCase()}`;
  const result = await imageUploadService.uploadFile(file, {
    folder,
  });

  if (!result.ok) {
    return { ok: false, error: result.message || "Upload failed" };
  }

  return { ok: true, url: result.url, publicId: result.publicId };
}

export async function discardProductImageUploadsAction(publicIds) {
  await requireAdmin();
  const ids = Array.from(publicIds || [])
    .filter((value) => typeof value === "string" && /^postmart\/[a-z0-9-]+\/[a-z0-9-]+\/[a-zA-Z0-9_-]+$/.test(value))
    .slice(0, 40);
  await Promise.allSettled(ids.map((publicId) => imageUploadService.delete(publicId)));
  return { ok: true };
}

export async function getCloudinaryConfigAction() {
  await requireAdmin();
  return {
    configured: imageUploadService.isConfigured(),
    ...imageUploadService.getUploadWidgetConfig(),
  };
}
