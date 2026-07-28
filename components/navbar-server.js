import { headers } from "next/headers";
import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";

export default async function NavbarServer({ collection }) {
    let activeCollection = collection;

    if (!activeCollection) {
        const headersList = await headers();
        const pathname = headersList.get("x-pathname") || "/";

        activeCollection = pathname.startsWith("/jewellery")
            ? "JEWELLERY"
            : "SHOES";
    }

    let categories = [];

    if (activeCollection === "JEWELLERY") {
        categories = await categoryService.getSubCategoriesBySlug("jewellery");
    } else {
        categories = await categoryService.getSubCategoriesBySlug("shoes");
    }

    return (
        <Navbar
            categories={categories}
            collection={activeCollection}
        />
    );
}