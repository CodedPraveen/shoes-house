import { revalidatePath, revalidateTag } from "next/cache";
import { productAdminService } from "@/services/product-admin-service";
import { clearProductCache } from "@/lib/product-cache";

async function revalidateProductPaths(slug) {
    await clearProductCache(slug);

    revalidateTag("products", "max");
    revalidateTag("search-catalog", "max");

    revalidatePath("/admin/products");
    revalidatePath("/admin/inventory");

    if (slug) {
        revalidatePath(`/product/${slug}`);
    }
}

export async function processProductUploadJob(input) {
    const product = await productAdminService.create(input);

    await revalidateProductPaths(product.slug);

    return product;
}