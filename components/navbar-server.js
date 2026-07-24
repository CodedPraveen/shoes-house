import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";

export default async function NavbarServer({ collection }) {
    let categories = [];

    if (collection === "JEWELLERY") {
        categories = await categoryService.getSubCategoriesBySlug("jewellery");
    } else if (collection === "SHOES") {
        categories = await categoryService.getSubCategoriesBySlug("shoes");
    }

    return (
        <Navbar
            categories={categories}
            collection={collection}
        />
    );
}