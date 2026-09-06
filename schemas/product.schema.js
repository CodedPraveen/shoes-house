import { z } from "zod";
import { validateProductImageUrl } from "../lib/product-image.js";

const optionalText = z.preprocess(
  (value) => (value == null || value === "" ? undefined : value),
  z.string().trim().max(5000).optional(),
);

const optionalInteger = z.preprocess(
  (value) => (value == null || value === "" ? undefined : value),
  z.coerce.number().int().nonnegative().optional(),
);

export const productImageReferenceSchema = z.object({
  url: z.string().trim().refine(
    (value) => validateProductImageUrl(value).isValid,
    "Product images must be staged uploads, stored images, or historical Cloudinary URLs",
  ),
  publicId: z.string().trim().min(1).max(500).optional(),
});

const productImageUrlsSchema = z.array(
  z.string().trim().refine(
    (value) => validateProductImageUrl(value).isValid,
    "Product images must be staged uploads, stored images, or historical Cloudinary URLs",
  ),
).max(8);

export const productCreationInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().min(1).max(120).default("Post Mart"),
  slug: z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1).max(10000),
  price: z.coerce.number().int().positive(),
  compareAtPrice: optionalInteger,
  discount: optionalInteger,
  stock: z.coerce.number().int().nonnegative().default(0),
  isNew: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  materials: optionalText,
  shippingInfo: optionalText,
  returnPolicy: optionalText,
  tags: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
  categorySlug: z.string().trim().min(1).max(200),
  collection: z.enum(["SHOES", "JEWELLERY"]).optional(),
  sizes: z.array(z.coerce.number().int().positive()).max(100).default([]),
  imageUrls: productImageUrlsSchema.min(1),
});

export const productPersistenceInputSchema = productCreationInputSchema.extend({
  imageUrls: productImageUrlsSchema,
});

export function formatZodError(error) {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
    .join("; ");
}
