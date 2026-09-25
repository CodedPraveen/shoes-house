import { getAllCategories } from "@/services/category-service";
import { publicImageUrl } from "@/lib/image-storage";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return Response.json({
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        collection: category.collection,
        parentId: category.parentId,
        image: publicImageUrl(category.imageStoragePath) ?? category.imageUrl ?? null,
      })),
    });
  } catch {
    return Response.json({ error: "Categories unavailable" }, { status: 503 });
  }
}
