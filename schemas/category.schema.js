import { z } from "zod";

export const categoryCollectionSchema = z.enum(["SHOES", "JEWELLERY"]);

const stagingImageSchema = z
  .string()
  .trim()
  .regex(
    /^\/api\/admin\/images\/staging\/i_[a-f0-9]{32}$/,
    "Category image must be a valid uploaded image.",
  );

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required.")
    .max(80, "Category name must be 80 characters or fewer."),
  collection: categoryCollectionSchema,
  imageUrl: stagingImageSchema.nullable().optional(),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().trim().min(1, "Category is required."),
});

export function categoryValidationMessage(error) {
  return error.issues.map((issue) => issue.message).join(" ");
}