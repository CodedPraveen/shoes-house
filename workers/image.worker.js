import { imageJobSchema } from "../schemas/queue.schema.js"; 
async function processCategoryImageJob(data) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId,
    },
    select: {
      id: true,
      deletedAt: true,
      imageStoragePath: true,
    },
  });

  if (!category || category.deletedAt) {
    throw new UnrecoverableError(
      "Category no longer exists",
    );
  }

  const expectedPath = buildImageStoragePath(
    "categories",
    data.categoryId,
    data.image.imageId,
  );

  if (category.imageStoragePath === expectedPath) {
    await cleanupStaged([data.image]);

    return {
      categoryId: data.categoryId,
      skipped: true,
      reason: "already-ready",
    };
  }

  const converted = await convertStagedImage(
    "categories",
    data.categoryId,
    data.image.imageId,
  );

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.category.findUnique({
        where: {
          id: data.categoryId,
        },
        select: {
          id: true,
          deletedAt: true,
          imageStoragePath: true,
        },
      });

      if (!current || current.deletedAt) {
        throw new UnrecoverableError(
          "Category was deleted while processing",
        );
      }

      await tx.category.update({
        where: {
          id: data.categoryId,
        },
        data: {
          imageUrl: null,
          imageStoragePath: converted.storagePath,
          imageWidth: converted.width,
          imageHeight: converted.height,
        },
      });
    });
  } catch (error) {
    if (converted.created) {
      await removeStoredImage(
        converted.storagePath,
      ).catch(() => { });
    }

    throw error;
  }

  /*
   * Remove the old stored image after the database now
   * points to the new image.
   */
  if (
    category.imageStoragePath &&
    category.imageStoragePath !== converted.storagePath
  ) {
    await removeStoredImage(
      category.imageStoragePath,
    ).catch(() => { });
  }

  await cleanupStaged([data.image]);

  return {
    categoryId: data.categoryId,
    storagePath: converted.storagePath,
    width: converted.width,
    height: converted.height,
  };
}