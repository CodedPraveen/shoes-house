"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { productAdminService } from "@/services/product-admin-service";
import { imageUploadService } from "@/services/upload/image-upload-service";

function revalidateProductPaths(slug) {
  revalidateTag("products");
  revalidateTag("search-catalog");
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  if (slug) revalidatePath(`/product/${slug}`);
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

  const product = await productAdminService.create(input);
  revalidateProductPaths(product.slug);
  return { ok: true, product };
}

export async function updateProductAction(id, input) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-update", limit: 30, windowMs: 60_000 });

  const product = await productAdminService.update(id, input);
  revalidateProductPaths(product.slug);
  return { ok: true, product };
}

export async function deleteProductAction(id) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-product-delete", limit: 15, windowMs: 60_000 });

  const existing = await productAdminService.getForEdit(id);
  await productAdminService.softDelete(id);
  revalidateProductPaths(existing?.slug);
  return { ok: true };
}

export async function uploadProductImageAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-upload", limit: 40, windowMs: 60_000 });

  const file = formData.get("file");
  const result = await imageUploadService.uploadFile(file, {
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "aere/products",
  });

  if (!result.ok) {
    return { ok: false, error: result.message || "Upload failed" };
  }

  return { ok: true, url: result.url, publicId: result.publicId };
}

export async function getCloudinaryConfigAction() {
  await requireAdmin();
  return {
    configured: imageUploadService.isConfigured(),
    ...imageUploadService.getUploadWidgetConfig(),
  };
}
