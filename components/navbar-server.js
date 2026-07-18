import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";

export default async function NavbarServer({
    collection = "SHOES",
}) {
    const categories =
        collection === "JEWELLERY"
            ? await categoryService.getSubCategoriesBySlug("jewellery")
            : await categoryService.getSubCategoriesBySlug("shoes");

    return (
        <Navbar
            categories={categories}
            collection={collection}
        />
    );
}