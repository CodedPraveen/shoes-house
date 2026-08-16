import { headers } from "next/headers";
import Navbar from "@/components/navbar";
import { categoryService } from "@/services/category-service";
import { CartProvider } from "@/context/cart-context";
import { getNavbarItems } from "@/services/storefront-service";

export default async function NavbarServer({ collection }) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || "/";

    let activeCollection = collection;

    if (!activeCollection) {
        activeCollection = pathname.startsWith("/jewellery")
            ? "JEWELLERY"
            : "SHOES";
    }

    const homeHref =
        activeCollection === "JEWELLERY"
            ? "/jewellery"
            : "/shoes";

    const [categories, navItems] = await Promise.all([
        activeCollection === "JEWELLERY"
            ? categoryService.getSubCategoriesBySlug("jewellery")
            : categoryService.getSubCategoriesBySlug("shoes"),
        getNavbarItems(activeCollection),
    ]);

    return (
        <CartProvider>
            <Navbar
                categories={categories}
                collection={activeCollection}
                homeHref={homeHref}
                managedNavItems={navItems}
            />
        </CartProvider>
    );
}
