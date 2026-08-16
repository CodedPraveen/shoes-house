"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { assertRateLimit } from "@/lib/rate-limit";
import { imageUploadService } from "@/services/upload/image-upload-service";
import {
  PRODUCT_SECTION_DEFAULTS,
  getProductSectionDefaults,
  isProductSectionKey,
} from "@/services/storefront-service";

const COLLECTIONS = new Set(["SHOES", "JEWELLERY"]);
const TARGET_TYPES = new Set(["COLLECTION", "CATEGORY", "PRODUCT", "CUSTOM"]);
const ASSET_FOLDERS = { HERO: "hero", LIFESTYLE: "lifestyle", NAVBAR: "navbar" };

function collectionValue(formData) {
  const value = String(formData.get("collection") ?? "");
  if (!COLLECTIONS.has(value)) throw new Error("Invalid collection.");
  return value;
}

function localHref(value) {
  const href = String(value ?? "").trim();
  if (!href) return null;
  if (!href.startsWith("/") || href.startsWith("//")) throw new Error("Custom links must be local Post Mart paths.");
  return href.slice(0, 300);
}

function numberValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

function nullableId(value) {
  const id = String(value ?? "").trim();
  return id || null;
}

async function validatedTargets(collection, targetType, categoryId, productId) {
  if (!TARGET_TYPES.has(targetType)) throw new Error("Invalid destination type.");
  const [category, product] = await Promise.all([
    categoryId ? prisma.category.findFirst({ where: { id: categoryId, collection, deletedAt: null }, select: { id: true } }) : null,
    productId ? prisma.product.findFirst({ where: { id: productId, collection, deletedAt: null }, select: { id: true } }) : null,
  ]);
  if (targetType === "CATEGORY" && !category) throw new Error("Choose an active category.");
  if (targetType === "PRODUCT" && !product) throw new Error("Choose an active product.");
  return { categoryId: targetType === "CATEGORY" ? category.id : null, productId: targetType === "PRODUCT" ? product.id : null };
}

async function uploadStorefrontAsset(file, kind, alt) {
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return null;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG, or WEBP image up to 10 MB.");
  }
  const suffix = ASSET_FOLDERS[kind];
  if (!suffix) throw new Error("Invalid storefront asset type.");
  const folder = `postmart/storefront/${suffix}`;
  const result = await imageUploadService.uploadFile(file, { folder });
  if (!result.ok) throw new Error(result.message || "Image upload failed.");
  return prisma.mediaAsset.create({ data: { url: result.url, publicId: result.publicId, folder, alt: alt || null } });
}

function refreshStorefront(collection) {
  revalidatePath("/new-admin/storefront");
  revalidatePath(collection === "JEWELLERY" ? "/jewellery" : "/shoes");
}

export async function saveStorefrontSectionAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  const key = String(formData.get("key") ?? "");
  if (!isProductSectionKey(key)) throw new Error("Invalid product section.");
  const title = String(formData.get("title") ?? key).trim().slice(0, 120);
  if (!title) throw new Error("Section title is required.");
  const data = {
    title,
    subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 200) || null,
    enabled: formData.get("enabled") === "on",
  };
  const existing = await prisma.storefrontSection.findUnique({
    where: { collection_key: { collection, key } },
    select: { id: true },
  });
  if (existing) {
    // An ordinary edit must never be an ordering operation.
    await prisma.storefrontSection.update({ where: { id: existing.id }, data });
  } else {
    const fallback = PRODUCT_SECTION_DEFAULTS.find((section) => section.key === key);
    if (!fallback) throw new Error("Product section no longer exists.");
    await prisma.storefrontSection.create({
      data: { collection, key, sortOrder: fallback.sortOrder, ...data },
    });
  }
  refreshStorefront(collection);
}

export async function createStorefrontProductSectionAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  const title = String(formData.get("title") ?? "").trim().slice(0, 120);
  if (!title) throw new Error("Section title is required.");
  const rows = await prisma.storefrontSection.findMany({
    where: { collection },
    select: { key: true, sortOrder: true },
  });
  const storedByKey = new Map(rows.map((section) => [section.key, section.sortOrder]));
  const defaults = getProductSectionDefaults(collection);
  const defaultKeys = new Set(defaults.map((section) => section.key));
  const existingOrders = rows
    .filter((section) => defaultKeys.has(section.key) || section.key.startsWith("PRODUCT_"))
    .map((section) => section.sortOrder);
  const defaultOrders = defaults.map((section) => storedByKey.get(section.key) ?? section.sortOrder);
  const nextSortOrder = Math.max(0, ...existingOrders, ...defaultOrders) + 1;
  await prisma.storefrontSection.create({
    data: {
      collection,
      key: `PRODUCT_${randomUUID().replaceAll("-", "").toUpperCase()}`,
      title,
      subtitle: String(formData.get("subtitle") ?? "").trim().slice(0, 200) || null,
      enabled: formData.get("enabled") === "on",
      sortOrder: nextSortOrder,
    },
  });
  refreshStorefront(collection);
}

export async function moveStorefrontProductSectionAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  const key = String(formData.get("key") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!isProductSectionKey(key) || !["up", "down"].includes(direction)) throw new Error("Invalid section move.");

  await prisma.$transaction(async (tx) => {
    const defaults = getProductSectionDefaults(collection);
    for (const fallback of defaults) {
      await tx.storefrontSection.upsert({
        where: { collection_key: { collection, key: fallback.key } },
        create: { collection, ...fallback },
        update: {},
      });
    }
    const rows = (await tx.storefrontSection.findMany({
      where: { collection },
      orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
      select: { id: true, key: true },
    })).filter((section) => defaults.some((fallback) => fallback.key === section.key) || section.key.startsWith("PRODUCT_"));
    const currentIndex = rows.findIndex((section) => section.key === key);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
    const reordered = [...rows];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];
    for (const [index, section] of reordered.entries()) {
      await tx.storefrontSection.update({
        where: { id: section.id },
        data: { sortOrder: index + 1 },
      });
    }
  });
  refreshStorefront(collection);
}

export async function saveStorefrontSectionItemAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  const key = String(formData.get("key") ?? "");
  const fallback = PRODUCT_SECTION_DEFAULTS.find((section) => section.key === key);
  if (!isProductSectionKey(key)) throw new Error("Invalid product section.");
  const productId = nullableId(formData.get("productId"));
  if (!productId) throw new Error("Choose a product.");
  const product = await prisma.product.findFirst({ where: { id: productId, collection, deletedAt: null }, select: { id: true } });
  if (!product) throw new Error("Invalid product.");
  let section = await prisma.storefrontSection.findUnique({ where: { collection_key: { collection, key } }, select: { id: true } });
  if (!section) {
    if (!fallback) throw new Error("Product section no longer exists.");
    section = await prisma.storefrontSection.create({ data: { collection, ...fallback }, select: { id: true } });
  }
  const lastItem = await prisma.storefrontSectionItem.aggregate({ where: { sectionId: section.id }, _max: { sortOrder: true } });
  await prisma.storefrontSectionItem.create({
    data: { sectionId: section.id, productId: product.id, sortOrder: (lastItem._max.sortOrder ?? -1) + 1 },
  });
  refreshStorefront(collection);
}

export async function disableStorefrontSectionItemAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  await prisma.storefrontSectionItem.updateMany({ where: { id: String(formData.get("id") ?? ""), section: { collection } }, data: { enabled: false } });
  refreshStorefront(collection);
}

export async function reorderStorefrontSectionItemAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  await prisma.storefrontSectionItem.updateMany({
    where: { id: String(formData.get("id") ?? ""), section: { collection } },
    data: { sortOrder: numberValue(formData.get("sortOrder")) },
  });
  refreshStorefront(collection);
}

export async function saveHeroSlideAction(formData) {
  await requireAdmin();
  await assertRateLimit({ prefix: "storefront-hero", limit: 20, windowMs: 60_000 });
  const collection = collectionValue(formData);
  const id = nullableId(formData.get("id"));
  const alt = String(formData.get("alt") ?? "").trim().slice(0, 160);
  if (!alt) throw new Error("Alt text is required.");
  const targetType = String(formData.get("targetType") ?? "COLLECTION");
  const target = await validatedTargets(collection, targetType, nullableId(formData.get("categoryId")), nullableId(formData.get("productId")));
  const customHref = targetType === "CUSTOM" ? localHref(formData.get("customHref")) : null;
  const asset = await uploadStorefrontAsset(formData.get("image"), "HERO", alt);
  if (!id && !asset) throw new Error("Choose a hero image.");
  const data = { alt, enabled: formData.get("enabled") === "on", sortOrder: numberValue(formData.get("sortOrder")), targetType, ...target, customHref, ...(asset ? { mediaAssetId: asset.id } : {}) };
  if (id) await prisma.heroSlide.updateMany({ where: { id, collection }, data });
  else await prisma.heroSlide.create({ data: { collection, mediaAssetId: asset.id, ...data } });
  refreshStorefront(collection);
}

export async function disableHeroSlideAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  await prisma.heroSlide.updateMany({ where: { id: String(formData.get("id") ?? ""), collection }, data: { enabled: false } });
  refreshStorefront(collection);
}

export async function saveNavbarItemAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  const id = nullableId(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim().slice(0, 80);
  if (!label) throw new Error("Navigation label is required.");
  const targetType = String(formData.get("targetType") ?? "COLLECTION");
  const target = await validatedTargets(collection, targetType, nullableId(formData.get("categoryId")), nullableId(formData.get("productId")));
  const data = { collection, label, enabled: formData.get("enabled") === "on", sortOrder: numberValue(formData.get("sortOrder")), targetType, ...target, customHref: targetType === "CUSTOM" ? localHref(formData.get("customHref")) : null };
  if (id) await prisma.navbarItem.updateMany({ where: { id, collection }, data });
  else await prisma.navbarItem.create({ data });
  refreshStorefront(collection);
}

export async function disableNavbarItemAction(formData) {
  await requireAdmin();
  const collection = collectionValue(formData);
  await prisma.navbarItem.updateMany({ where: { id: String(formData.get("id") ?? ""), collection }, data: { enabled: false } });
  refreshStorefront(collection);
}
