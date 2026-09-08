import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const IMAGE_ID_PATTERN = /^i_[a-f0-9]{32}$/;
const ENTITY_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const STORAGE_PATH_PATTERN = /^(products|categories|banners)\/([A-Za-z0-9_-]{1,100})\/(i_[a-f0-9]{32})\.webp$/;
const STAGING_URL_PREFIX = "/api/admin/images/staging/";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function getImageStorageRoot(environment = process.env) {
  const configured = String(environment.IMAGE_STORAGE_ROOT || "").trim();
  return path.resolve(
    /* turbopackIgnore: true */ configured ||
      path.join(/* turbopackIgnore: true */ process.cwd(), ".data", "images"),
  );
}

export function createImageId() {
  return `i_${randomUUID().replaceAll("-", "")}`;
}

export function assertImageId(value) {
  const imageId = String(value || "");
  if (!IMAGE_ID_PATTERN.test(imageId)) throw new Error("Invalid image ID");
  return imageId;
}

export function assertEntityId(value) {
  const entityId = String(value || "");
  if (!ENTITY_ID_PATTERN.test(entityId)) throw new Error("Invalid image owner ID");
  return entityId;
}

export function sniffInputMime(buffer) {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  ) return "image/jpeg";

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return "image/png";

  return null;
}

export function stagingImageUrl(imageId) {
  return `${STAGING_URL_PREFIX}${assertImageId(imageId)}`;
}

export function imageIdFromStagingUrl(value) {
  if (typeof value !== "string" || !value.startsWith(STAGING_URL_PREFIX)) return null;
  const imageId = value.slice(STAGING_URL_PREFIX.length);
  return IMAGE_ID_PATTERN.test(imageId) ? imageId : null;
}

export function isStagingImageUrl(value) {
  return Boolean(imageIdFromStagingUrl(value));
}

export function resolveStagingPath(imageId, environment = process.env) {
  return path.join(
    /* turbopackIgnore: true */ getImageStorageRoot(environment),
    "staging",
    `${assertImageId(imageId)}.upload`,
  );
}

export function buildImageStoragePath(kind, entityId, imageId) {
  if (!new Set(["products", "categories", "banners"]).has(kind)) {
    throw new Error("Invalid image storage kind");
  }
  return `${kind}/${assertEntityId(entityId)}/${assertImageId(imageId)}.webp`;
}

export function resolveImageStoragePath(storagePath, environment = process.env) {
  const normalized = String(storagePath || "").replaceAll("\\", "/");
  if (!STORAGE_PATH_PATTERN.test(normalized)) throw new Error("Invalid image storage path");
  return path.join(
    /* turbopackIgnore: true */ getImageStorageRoot(environment),
    ...normalized.split("/"),
  );
}

export function publicImageUrl(storagePath) {
  const normalized = String(storagePath || "").replaceAll("\\", "/");
  if (!STORAGE_PATH_PATTERN.test(normalized)) return null;
  return `/images/${normalized}`;
}

export async function stageImageFile(file) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size <= 0) {
    return { ok: false, message: "Choose a JPG or PNG image." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Each image must be 10 MB or smaller." };
  }
  if (!new Set(["image/jpeg", "image/png"]).has(file.type)) {
    return { ok: false, message: "Only JPG and PNG images are supported." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = sniffInputMime(buffer);
  if (!detectedMime) {
    return { ok: false, message: "The selected file is not a valid JPG or PNG image." };
  }

  const imageId = createImageId();
  const stagingPath = resolveStagingPath(imageId);
  await mkdir(path.dirname(stagingPath), { recursive: true });
  await writeFile(stagingPath, buffer, { flag: "wx", mode: 0o600 });

  return {
    ok: true,
    imageId,
    url: stagingImageUrl(imageId),
    mimeType: detectedMime,
  };
}

export async function readStagedImage(imageId) {
  return readFile(resolveStagingPath(imageId));
}

export async function removeStagedImage(imageId) {
  await rm(resolveStagingPath(imageId), { force: true });
}

export async function removeStoredImage(storagePath) {
  await rm(resolveImageStoragePath(storagePath), { force: true });
}
