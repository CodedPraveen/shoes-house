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

  const parsed = productImageJobSchema.safeParse(job.data);
  if (!parsed.success) {
    console.error("[PRODUCT IMAGE] INVALID JOB PAYLOAD", {
      jobId: job.id,
    });

    throw new UnrecoverableError("Invalid product image job payload");
  }

  const { productId, images } = parsed.data;
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, deletedAt: true, processingStatus: true, pendingImageUrls: true },
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

  const { cloudName } = configureCloudinary();

  const verifiedImages = [];
  for (const [index, image] of images.entries()) {
    
    verifiedImages.push(
      await verifyCloudinaryImage(image, cloudName)
    );

  }

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

    await tx.product.update({
      where: { id: productId },
      data: {
        processingStatus: "READY",
        processingError: null,
        processedAt: new Date(),
        pendingImageUrls: [],
      },
    });
  });

  return { productId, imageCount: verifiedImages.length };
}
