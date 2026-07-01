import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";

export default async function NavbarServer() {
    const categories = await categoryService.getAll();

    return <Navbar categories={categories} />;
}