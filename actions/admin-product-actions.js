"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { productAdminService } from "@/services/product-admin-service";
import { imageUploadService } from "@/services/upload/image-upload-service";
import { clearProductCache } from "@/lib/product-cache";
import { enqueueProductImages, retryProductImages } from "@/queues";
import {
  formatZodError,
  productCreationFieldsSchema,
  productCreationInputSchema,
} from "@/schemas/product.schema";
import {
  imageIdFromStagingUrl,
  isStagingImageUrl,
} from "@/lib/image-storage";
import {
  createProductUploadSession,
  deleteProductUploadSession,
  getProductUploadSession,
} from "@/lib/product-upload-session";
import { productImageSource } from "@/lib/mappers/product-mapper";

const MAX_PRODUCT_IMAGES = 8;

function parseJsonField(formData, name) {
  const value = formData.get(name);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid ${name}.`);
  }
}

function getProductFiles(formData) {
  return formData
    .getAll("files")
    .filter(
      (file) =>
        file &&
        typeof file.arrayBuffer === "function",
    );
}

function productImageJobPayload(
  productId,
  orderedSources,
  existingImages = [],
) {
  const existingBySource = new Map(
    existingImages.map((image) => [
      productImageSource(image),
      image.id,
    ]),
  );

  const images = [];
  const retainedImages = [];

  orderedSources.forEach((source, sortOrder) => {
    const imageId = imageIdFromStagingUrl(source);

    if (imageId) {
      images.push({
        imageId,
        sortOrder,
      });

      return;
    }

    const existingId = existingBySource.get(source);

    if (!existingId) {
      throw new Error(
        "Product image reference is not a staged or existing image.",
      );
    }

    retainedImages.push({
      imageId: existingId,
      sortOrder,
    });
  });

  return {
    productId,
    images,
    retainedImages,
    stagingRecord: orderedSources,
  };
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

async function cleanupStagedReferences(references) {
  const staged = references.filter(isStagingImageUrl);

  if (!staged.length) return;

  await Promise.allSettled(
    staged.map((reference) =>
      imageUploadService.delete(reference),
    ),
  );
}

async function stageProductFiles(files, imageOrder) {
  const stagedUrls = [];
  const stagedReferences = [];
  const fileResults = [];

  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new Error(
      `Maximum ${MAX_PRODUCT_IMAGES} product images are allowed.`,
    );
  }

  for (const file of files) {
    const result = await imageUploadService.uploadFile(file);

    if (!result.ok) {
      await cleanupStagedReferences(stagedReferences);

      throw new Error(
        result.message || "One or more images could not be staged.",
      );
    }

    stagedUrls.push(result.url);
    stagedReferences.push(result.url);
    fileResults.push(result);
  }

  if (!imageOrder.length || imageOrder.length > MAX_PRODUCT_IMAGES) {
    await cleanupStagedReferences(stagedReferences);
    throw new Error(
      "A valid product image order is required.",
    );
  }

  const orderedSources = [];
  const usedFileIndexes = new Set();

  for (const item of imageOrder) {
    if (item?.type === "existing") {
      if (
        typeof item.url !== "string" ||
        !item.url.trim()
      ) {
        await cleanupStagedReferences(stagedReferences);
        throw new Error("Invalid existing product image.");
      }

      orderedSources.push(item.url);
      continue;
    }

    if (item?.type === "file") {
      const index = Number(item.index);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= fileResults.length ||
        usedFileIndexes.has(index)
      ) {
        await cleanupStagedReferences(stagedReferences);
        throw new Error("Invalid product image order.");
      }

      usedFileIndexes.add(index);
      orderedSources.push(fileResults[index].url);
      continue;
    }

    await cleanupStagedReferences(stagedReferences);
    throw new Error("Invalid product image order.");
  }

  if (usedFileIndexes.size !== fileResults.length) {
    await cleanupStagedReferences(stagedReferences);
    throw new Error(
      "Every selected image must be included.",
    );
  }

  return {
    orderedSources,
    stagedReferences,
  };
}

export async function getAdminCategoriesAction() {
  await requireAdmin();
  return productAdminService.listCategories();
}

export async function getAdminProductForEditAction(id) {
  await requireAdmin();
  return productAdminService.getForEdit(id);
}

export async function createProductAction(formData) {
  const user = await requireAdmin();

  await assertRateLimit({
    prefix: "admin-product-create",
    limit: 20,
    windowMs: 60_000,
  });

  if (!(formData instanceof FormData)) {
    return {
      ok: false,
      error: "Invalid product submission.",
    };
  }

  let stagedReferences = [];

  try {
    const productFields = parseJsonField(
      formData,
      "product",
    );

    const uploadSessionId =
      formData.get("uploadSessionId");

    const imageOrderValue =
      formData.get("imageOrder");

    const imageOrder =
      typeof imageOrderValue === "string" &&
        imageOrderValue.trim()
        ? JSON.parse(imageOrderValue)
        : null;

    const validation =
      productCreationFieldsSchema.safeParse(
        productFields,
      );

    if (!validation.success) {
      return {
        ok: false,
        error: formatZodError(validation.error),
      };
    }

    if (
      !Array.isArray(imageOrder) ||
      imageOrder.length < 1 ||
      imageOrder.length > MAX_PRODUCT_IMAGES
    ) {
      return {
        ok: false,
        error: "Add between 1 and 8 product images.",
      };
    }

    let orderedSources = [];

    if (
      typeof uploadSessionId === "string" &&
      uploadSessionId.trim()
    ) {
      const uploadSession =
        await getProductUploadSession(
          uploadSessionId,
        );

      if (!uploadSession) {
        return {
          ok: false,
          error:
            "Upload session expired. Please upload the images again.",
        };
      }

      if (uploadSession.userId !== user.id) {
        return {
          ok: false,
          error: "Invalid upload session.",
        };
      }

      if (
        !Array.isArray(uploadSession.images) ||
        uploadSession.images.length < 1 ||
        uploadSession.images.length >
        MAX_PRODUCT_IMAGES
      ) {
        return {
          ok: false,
          error:
            "Upload between 1 and 8 product images.",
        };
      }

      orderedSources = uploadSession.images;

      stagedReferences = [
        ...uploadSession.images,
      ];
    } else {
      const files = getProductFiles(formData);

      if (!files.length) {
        return {
          ok: false,
          error: "Add at least one product image.",
        };
      }

      if (
        !Array.isArray(imageOrder) ||
        imageOrder.length < 1 ||
        imageOrder.length > MAX_PRODUCT_IMAGES
      ) {
        return {
          ok: false,
          error:
            "A valid product image order is required.",
        };
      }

      const staged = await stageProductFiles(
        files,
        imageOrder,
      );

      stagedReferences =
        staged.stagedReferences;

      orderedSources =
        staged.orderedSources;
    }

    const category =
      await productAdminService.getUploadCategory(
        validation.data.collection,
        validation.data.categorySlug,
      );

    if (!category) {
      return {
        ok: false,
        error:
          "Choose a valid collection and category before creating the product.",
      };
    }

    const fullInput = {
      ...validation.data,
      imageUrls: orderedSources,
    };

    const fullValidation =
      productCreationInputSchema.safeParse(
        fullInput,
      );

    if (!fullValidation.success) {
      await cleanupStagedReferences(stagedReferences);

      return {
        ok: false,
        error: formatZodError(fullValidation.error),
      };
    }

    const product =
      await productAdminService.createProcessing(
        fullValidation.data,
      );

    let job;

    try {
      job = await enqueueProductImages({
        productId: product.id,
        ...productImageJobPayload(
          product.id,
          fullValidation.data.imageUrls,
        ),
      });

      await productAdminService.setProcessingJobId(
        product.id,
        job.id,
      );
    } catch (error) {
      console.error(
        "[PRODUCT CREATE] enqueue FAILED",
        {
          productId: product.id,
          error: error?.message,
          stack: error?.stack,
        },
      );

      await productAdminService.markProcessingFailed(
        product.id,
        "Image processing could not be queued. Retry after Redis is available.",
      );

      await cleanupStagedReferences(stagedReferences);

      return {
        ok: false,
        productId: product.id,
        error:
          "The product was saved as failed because image processing could not be queued.",
      };
    }

    await revalidateProductPaths(product.slug);

    if (
      typeof uploadSessionId === "string" &&
      uploadSessionId.trim()
    ) {
      await deleteProductUploadSession(
        uploadSessionId,
      );
    }

    return {
      ok: true,
      queued: true,
      jobId: job.id,
      product,
      message: "Product created — processing images.",
    };
  } catch (error) {
    console.error(
      "[PRODUCT CREATE] failed",
      error,
    );

    await cleanupStagedReferences(
      stagedReferences,
    );

    return {
      ok: false,
      error:
        error?.message ||
        "Unable to create product.",
    };
  }
}

export async function createProductUploadSessionAction() {
  const user = await requireAdmin();

  await assertRateLimit({
    prefix: "admin-product-upload-session",
    limit: 20,
    windowMs: 60_000,
  });

  const sessionId =
    await createProductUploadSession(
      user.id,
    );

  return {
    ok: true,
    uploadSessionId: sessionId,
  };
}

export async function updateProductAction(
  id,
  formData,
) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-product-update",
    limit: 30,
    windowMs: 60_000,
  });

  if (!(formData instanceof FormData)) {
    return {
      ok: false,
      error: "Invalid product submission.",
    };
  }

  let stagedReferences = [];

  try {
    const productFields = parseJsonField(
      formData,
      "product",
    );

    const imageOrder = parseJsonField(
      formData,
      "imageOrder",
    );

    const validation =
      productCreationFieldsSchema.safeParse(
        productFields,
      );

    if (!validation.success) {
      return {
        ok: false,
        error: formatZodError(validation.error),
      };
    }

    const existing =
      await productAdminService.getForEdit(id);

    if (!existing) {
      return {
        ok: false,
        error: "Product not found.",
      };
    }

    const files = getProductFiles(formData);

    const staged = await stageProductFiles(
      files,
      imageOrder,
    );

    stagedReferences = staged.stagedReferences;

    const existingSources = new Set(
      existing.imageRecords.map(productImageSource),
    );

    const invalidExisting = staged.orderedSources.find(
      (source) =>
        !isStagingImageUrl(source) &&
        !existingSources.has(source),
    );

    if (invalidExisting) {
      await cleanupStagedReferences(
        stagedReferences,
      );

      return {
        ok: false,
        error:
          "Product images must be existing images or new device uploads.",
      };
    }

    const stagedSources =
      staged.orderedSources.filter(
        isStagingImageUrl,
      );

    const retainedSources =
      staged.orderedSources.filter(
        (source) => !isStagingImageUrl(source),
      );

    const fullInput = {
      ...validation.data,
      imageUrls: retainedSources,
    };

    const persistenceValidation =
      productCreationInputSchema
        .extend({
          imageUrls:
            productCreationInputSchema.shape.imageUrls,
        })
        .safeParse({
          ...validation.data,
          imageUrls:
            staged.orderedSources,
        });

    if (!persistenceValidation.success) {
      await cleanupStagedReferences(
        stagedReferences,
      );

      return {
        ok: false,
        error: formatZodError(
          persistenceValidation.error,
        ),
      };
    }

    const product =
      await productAdminService.update(
        id,
        {
          ...fullInput,
          imageUrls: retainedSources,
        },
        {
          allowEmptyImages:
            stagedSources.length > 0,
        },
      );

    if (stagedSources.length) {
      const payload =
        productImageJobPayload(
          id,
          staged.orderedSources,
          existing.imageRecords,
        );

      await productAdminService.beginImageProcessing(
        id,
        staged.orderedSources,
      );

      try {
        const job =
          await enqueueProductImages(
            payload,
          );

        await productAdminService.setProcessingJobId(
          id,
          job.id,
        );
      } catch (error) {
        await productAdminService.markProcessingFailed(
          id,
          "Image processing could not be queued.",
        );

        await cleanupStagedReferences(
          stagedReferences,
        );

        return {
          ok: false,
          productId: id,
          error:
            "Product changes were saved, but image processing could not be queued.",
        };
      }
    }

    await revalidateProductPaths(
      product.slug,
    );

    return {
      ok: true,
      product,
      queued: stagedSources.length > 0,
    };
  } catch (error) {
    console.error(
      "[PRODUCT UPDATE] failed",
      error,
    );

    await cleanupStagedReferences(
      stagedReferences,
    );

    return {
      ok: false,
      error:
        error?.message ||
        "Unable to update product.",
    };
  }
}

export async function deleteProductAction(id) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-product-delete",
    limit: 15,
    windowMs: 60_000,
  });

  const existing =
    await productAdminService.getForEdit(id);

  await productAdminService.softDelete(id);

  await revalidateProductPaths(
    existing?.slug,
  );

  return { ok: true };
}

export async function getSubCategoriesAction(
  collection,
) {
  await requireAdmin();

  return productAdminService.listSubCategories(
    collection,
  );
}

/*
 * Kept for any other existing callers.
 *
 * The new product form no longer uses these during
 * image selection.
 */
export async function uploadProductImageAction(
  formData,
) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-upload",
    limit: 40,
    windowMs: 60_000,
  });

  const file = formData.get("file");

  const result =
    await imageUploadService.uploadFile(file);

  if (!result.ok) {
    return {
      ok: false,
      error:
        result.message || "Upload failed",
    };
  }

  return {
    ok: true,
    url: result.url,
    imageId: result.imageId,
  };
}

export async function uploadNewAdminProductImageAction(
  formData,
) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "new-admin-upload",
    limit: 40,
    windowMs: 60_000,
  });

  const file = formData.get("file");

  const supportedTypes = new Set([
    "image/jpeg",
    "image/png",
  ]);

  if (
    !file ||
    !supportedTypes.has(file.type)
  ) {
    return {
      ok: false,
      error: "Choose a JPG or PNG image.",
    };
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      ok: false,
      error:
        "Each product image must be 10 MB or smaller.",
    };
  }

  const collection = String(
    formData.get("collection") ?? "",
  );

  const categorySlug = String(
    formData.get("categorySlug") ?? "",
  );

  const category =
    await productAdminService.getUploadCategory(
      collection,
      categorySlug,
    );

  if (!category) {
    return {
      ok: false,
      error:
        "Choose a valid collection and category before uploading.",
    };
  }

  const result =
    await imageUploadService.uploadFile(file);

  if (!result.ok) {
    return {
      ok: false,
      error:
        result.message || "Upload failed",
    };
  }

  return {
    ok: true,
    url: result.url,
    imageId: result.imageId,
  };
}

export async function discardProductImageUploadsAction(
  references,
) {
  await requireAdmin();

  const ids = Array.from(references || [])
    .filter(isStagingImageUrl)
    .slice(0, 40);

  await Promise.allSettled(
    ids.map((reference) =>
      imageUploadService.delete(reference),
    ),
  );

  return { ok: true };
}
export async function retryProductImageProcessingAction(productId) {
  await requireAdmin();

  await assertRateLimit({
    prefix: "admin-product-image-retry",
    limit: 20,
    windowMs: 60_000,
  });

  const product =
    await productAdminService.getForEdit(productId);

  if (!product) {
    return {
      ok: false,
      error: "Product not found.",
    };
  }

  const imageUrls = product.imageRecords
    .map(productImageSource)
    .filter(Boolean);

  if (!imageUrls.length) {
    return {
      ok: false,
      error: "No product images are available to retry.",
    };
  }

  const stagedUrls = imageUrls.filter(
    isStagingImageUrl,
  );

  if (!stagedUrls.length) {
    return {
      ok: false,
      error:
        "There are no staged images available for retry.",
    };
  }

  const payload = productImageJobPayload(
    productId,
    imageUrls,
    product.imageRecords,
  );

  try {
    const job = await retryProductImages(
      payload,
      product.processingJobId,
    );

    await productAdminService.beginImageProcessing(
      productId,
      imageUrls,
    );

    await productAdminService.setProcessingJobId(
      productId,
      job.id,
    );

    await revalidateProductPaths(
      product.slug,
    );

    return {
      ok: true,
      queued: true,
      jobId: job.id,
    };
  } catch (error) {
    console.error(
      "[PRODUCT IMAGE RETRY] failed",
      error,
    );

    return {
      ok: false,
      error:
        error?.message ||
        "Unable to retry image processing.",
    };
  }
}