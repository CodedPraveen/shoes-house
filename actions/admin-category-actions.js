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
import { imageUploadService } from "@/services/upload/image-upload-service";
import { imageIdFromStagingUrl, isStagingImageUrl } from "@/lib/image-storage";
import { enqueueCategoryImage } from "@/queues";

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

async function stageCategoryImage(formData) {
  const file = formData.get("image");

  if (!file || typeof file.arrayBuffer !== "function" || file.size <= 0) {
    return {
      ok: true,
      image: null,
    };
  }

  const result = await imageUploadService.uploadFile(file);

  if (!result.ok) {
    return {
      ok: false,
      error: result.message || "Category image upload failed.",
    };
  }

  return {
    ok: true,
    image: {
      imageId: result.imageId,
      url: result.url,
    },
  };
}

export async function createCategoryAction(
  _previousState = initialResult,
  formData,
) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-category-create",
    limit: 20,
    windowMs: 60_000,
  });

  const imageResult = await stageCategoryImage(formData);

  if (!imageResult.ok) {
    return {
      ok: false,
      error: imageResult.error,
      message: null,
    };
  }

  const validation = createCategorySchema.safeParse({
    name: formData.get("name"),
    collection: formData.get("collection"),
    imageUrl: imageResult.image?.url ?? null,
  });

  if (!validation.success) {
    if (imageResult.image?.url) {
      await imageUploadService.delete(imageResult.image.url);
    }

    return {
      ok: false,
      error: categoryValidationMessage(validation.error),
      message: null,
    };
  }

  try {
    const category = await categoryAdminService.create({
      name: validation.data.name,
      collection: validation.data.collection,
    });

    if (imageResult.image) {
      try {
        const job = await enqueueCategoryImage({
          categoryId: category.id,
          image: {
            imageId: imageResult.image.imageId,
            sortOrder: 0,
          },
          stagingRecord: imageResult.image.url,
        });

        await categoryAdminService.setImageProcessingJobId(
          category.id,
          job.id,
        );
      } catch (error) {
        console.error("[admin-categories] image enqueue failed", {
          categoryId: category.id,
          error: error?.message,
        });

        await imageUploadService.delete(imageResult.image.url);

        return {
          ok: false,
          error:
            "Category was created, but image processing could not be queued.",
          message: null,
        };
      }
    }

    await refreshCategoryData(validation.data.collection);

    return {
      ok: true,
      error: null,
      message: `${category.name} was added.`,
    };
  } catch (error) {
    if (imageResult.image?.url) {
      await imageUploadService.delete(imageResult.image.url);
    }

    return {
      ok: false,
      error: actionError(error, "Unable to add category."),
      message: null,
    };
  }
}

export async function updateCategoryAction(
  _previousState = initialResult,
  formData,
) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-category-update",
    limit: 40,
    windowMs: 60_000,
  });

  const imageResult = await stageCategoryImage(formData);

  if (!imageResult.ok) {
    return {
      ok: false,
      error: imageResult.error,
      message: null,
    };
  }

  const validation = updateCategorySchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    collection: formData.get("collection"),
    imageUrl: imageResult.image?.url ?? null,
  });

  if (!validation.success) {
    if (imageResult.image?.url) {
      await imageUploadService.delete(imageResult.image.url);
    }

    return {
      ok: false,
      error: categoryValidationMessage(validation.error),
      message: null,
    };
  }

  try {
    const category = await categoryAdminService.update({
      id: validation.data.id,
      name: validation.data.name,
      collection: validation.data.collection,
    });

    if (imageResult.image) {
      try {
        const job = await enqueueCategoryImage({
          categoryId: category.id,
          image: {
            imageId: imageResult.image.imageId,
            sortOrder: 0,
          },
          stagingRecord: imageResult.image.url,
        });

        await categoryAdminService.setImageProcessingJobId(
          category.id,
          job.id,
        );
      } catch (error) {
        console.error("[admin-categories] image enqueue failed", {
          categoryId: category.id,
          error: error?.message,
        });

        await imageUploadService.delete(imageResult.image.url);

        return {
          ok: false,
          error:
            "Category was updated, but image processing could not be queued.",
          message: null,
        };
      }
    }

    await refreshCategoryData(validation.data.collection);

    return {
      ok: true,
      error: null,
      message: `${category.name} was updated.`,
    };
  } catch (error) {
    if (imageResult.image?.url) {
      await imageUploadService.delete(imageResult.image.url);
    }

    return {
      ok: false,
      error: actionError(error, "Unable to update category."),
      message: null,
    };
  }
}
