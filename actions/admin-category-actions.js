"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-auth";
import { deleteCache } from "@/lib/redis/cache";
import { assertRateLimit } from "@/lib/rate-limit";
import {
  categoryValidationMessage,
  createCategorySchema,
  updateCategorySchema,
} from "@/schemas/category.schema";
import { CategoryAdminError, categoryAdminService } from "@/services/category-admin-service";

const initialResult = { ok: false, error: null, message: null };

async function refreshCategoryData(collection) {
  const parentSlug = collection === "JEWELLERY" ? "jewellery" : "shoes";

  await Promise.allSettled([
    deleteCache("categories:all"),
    deleteCache(`categories:${collection}`),
    deleteCache(`subcategories:${parentSlug}`),
  ]);

  revalidatePath("/new-admin/storefront/feature/categories");
  revalidatePath("/new-admin/products");
  revalidatePath("/new-admin/products/new");
}

function actionError(error, fallback) {
  if (error instanceof CategoryAdminError) return error.message;
  console.error("[admin-categories] action failed", error);
  return fallback;
}

export async function createCategoryAction(_previousState = initialResult, formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-category-create", limit: 20, windowMs: 60_000 });

  const validation = createCategorySchema.safeParse({
    name: formData.get("name"),
    collection: formData.get("collection"),
  });

  if (!validation.success) {
    return { ok: false, error: categoryValidationMessage(validation.error), message: null };
  }

  try {
    const category = await categoryAdminService.create(validation.data);
    await refreshCategoryData(validation.data.collection);
    return { ok: true, error: null, message: `${category.name} was added.` };
  } catch (error) {
    return { ok: false, error: actionError(error, "Unable to add category."), message: null };
  }
}

export async function updateCategoryAction(_previousState = initialResult, formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "admin-category-update", limit: 40, windowMs: 60_000 });

  const validation = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    collection: formData.get("collection"),
  });

  if (!validation.success) {
    return { ok: false, error: categoryValidationMessage(validation.error), message: null };
  }

  try {
    const category = await categoryAdminService.update(validation.data);
    await refreshCategoryData(validation.data.collection);
    return { ok: true, error: null, message: `${category.name} was updated.` };
  } catch (error) {
    return { ok: false, error: actionError(error, "Unable to update category."), message: null };
  }
}
