import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";

export default async function NavbarServer({
    collection = "SHOES",
}) {
    const categories = await categoryService.getAll();

    return (
        <Navbar
            categories={categories}
            collection={collection}
        />
    );
}