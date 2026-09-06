import { z } from "zod";

export const categoryCollectionSchema = z.enum(["SHOES", "JEWELLERY"]);

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80, "Category name must be 80 characters or fewer."),
  collection: categoryCollectionSchema,
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().trim().min(1, "Category is required."),
});

export function categoryValidationMessage(error) {
  return error.issues.map((issue) => issue.message).join(" ");
}
