import ProductGrid from "@/components/product-grid";
import { productService } from "@/services/product-service";

export const metadata = {
    title: "Shoes New Arrivals",
};

export default async function ShoesNewArrivalsPage() {
    const products = await productService.getNewArrivals(
        100,
        "SHOES"
    );

    return (
        <main className="mx-auto max-w-[1280px] px-4 py-12 md:px-16">
            <h1 className="mb-8 text-3xl font-semibold">
                New Arrivals
            </h1>

            <ProductGrid products={products} />
        </main>
    );
}