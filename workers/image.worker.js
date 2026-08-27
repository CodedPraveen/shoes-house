import { v2 as cloudinary } from "cloudinary";
import { UnrecoverableError } from "bullmq";
import { prisma } from "../lib/db.js";
import { getWorkerEnvironment, productImageJobSchema } from "../schemas/queue.schema.js";

function configureCloudinary() {
  const config = getWorkerEnvironment();
  const cloudName = config.CLOUDINARY_CLOUD_NAME;
  const apiKey = config.CLOUDINARY_API_KEY;
  const apiSecret = config.CLOUDINARY_API_SECRET;

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return { cloudName };
}

function publicIdFromUrl(url, expectedCloudName) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  const uploadIndex = parts.indexOf("upload");

  if (parts[0] !== expectedCloudName || uploadIndex < 0) {
    throw new UnrecoverableError("Image reference does not belong to the configured Cloudinary account");
  }

  const versionIndex = parts.findIndex((part, index) => index > uploadIndex && /^v\d+$/.test(part));
  const assetParts = parts.slice(versionIndex >= 0 ? versionIndex + 1 : uploadIndex + 1);
  if (!assetParts.length) throw new UnrecoverableError("Cloudinary image reference has no public ID");

  assetParts[assetParts.length - 1] = assetParts.at(-1).replace(/\.[^.]+$/, "");
  return decodeURIComponent(assetParts.join("/"));
}

async function verifyCloudinaryImage(image, cloudName) {
  const publicId = image.publicId || publicIdFromUrl(image.url, cloudName);

  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: "image" });
    if (!resource?.secure_url) throw new Error("Cloudinary returned an incomplete resource");
    return { url: image.url, publicId };
  } catch (error) {
    if (error?.http_code === 404) {
      throw new UnrecoverableError(`Cloudinary image does not exist: ${publicId}`);
    }
    throw error;
  }
}

export async function processProductImageJob(job) {
  console.log("[PRODUCT IMAGE] JOB START", {
    jobId: job.id,
    productId: job.data?.productId,
    imageCount: job.data?.images?.length,
  });

  const parsed = productImageJobSchema.safeParse(job.data);
  if (!parsed.success) {
    console.error("[PRODUCT IMAGE] INVALID JOB PAYLOAD", {
      jobId: job.id,
    });

    throw new UnrecoverableError("Invalid product image job payload");
  }

  const { productId, images } = parsed.data;
  console.log("[PRODUCT IMAGE] payload valid", {
    jobId: job.id,
    productId,
    imageCount: images.length,
  });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, deletedAt: true, processingStatus: true, pendingImageUrls: true },
  });

  console.log("[PRODUCT IMAGE] product loaded", {
    productId,
    exists: Boolean(product),
    processingStatus: product?.processingStatus,
    pendingImageCount: product?.pendingImageUrls?.length,
  });

  if (!product || product.deletedAt) {
    throw new UnrecoverableError("Product no longer exists");
  }

  if (product.processingStatus === "READY") {
    return { productId, skipped: true, reason: "already-ready" };
  }

  const queuedUrls = images.map((image) => image.url);
  if (
    product.pendingImageUrls.length !== queuedUrls.length ||
    product.pendingImageUrls.some((url, index) => url !== queuedUrls[index])
  ) {
    throw new UnrecoverableError("Queued image references do not match the product staging record");
  }

  console.log("[PRODUCT IMAGE] configuring Cloudinary", {
    productId,
  });

  const { cloudName } = configureCloudinary();

  console.log("[PRODUCT IMAGE] Cloudinary configured", {
    productId,
    cloudName,
  });

  const verifiedImages = [];
  for (const [index, image] of images.entries()) {
    console.log("[PRODUCT IMAGE] verifying image", {
      productId,
      index,
      url: image.url,
    });

    verifiedImages.push(
      await verifyCloudinaryImage(image, cloudName)
    );

    console.log("[PRODUCT IMAGE] image verified", {
      productId,
      index,
    });
  }

  console.log("[PRODUCT IMAGE] all images verified", {
    productId,
    imageCount: verifiedImages.length,
  });

  await prisma.$transaction(async (tx) => {
    const current = await tx.product.findUnique({
      where: { id: productId },
      select: { deletedAt: true, processingStatus: true },
    });

    if (!current || current.deletedAt) throw new UnrecoverableError("Product was deleted while processing");
    if (current.processingStatus === "READY") return;

    await tx.productImage.createMany({
      data: verifiedImages.map((image, index) => ({
        productId,
        url: image.url,
        publicId: image.publicId,
        alt: null,
        sortOrder: index,
        isHover: index === 1,
      })),
    });

    const imageCount = await tx.productImage.count({ where: { productId, deletedAt: null } });
    if (imageCount !== verifiedImages.length) {
      throw new UnrecoverableError("Product image finalization was incomplete");
    }

    console.log("[PRODUCT IMAGE] setting READY", {
      productId,
      imageCount: verifiedImages.length,
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        processingStatus: "READY",
        processingError: null,
        processedAt: new Date(),
        pendingImageUrls: [],
      },
    });
    console.log("[PRODUCT IMAGE] READY update complete", {
      productId,
    });
  });

  console.log("[PRODUCT IMAGE] JOB COMPLETE", {
    jobId: job.id,
    productId,
    imageCount: verifiedImages.length,
  });

  return { productId, imageCount: verifiedImages.length };
}
