import ProductGrid from "@/components/product-grid";
import { productService } from "@/services/product-service";

export const metadata = {
    title: "Trending Shoes",
};

export default async function ShoesTrendingPage() {
    const products = await productService.getTrending(
        100,
        "SHOES"
    );

    return (
        <main className="mx-auto max-w-7xl px-4 py-12 md:px-16 pt-22">
            <h1 className="mb-8 text-3xl font-semibold">
                Trending Shoes
            </h1>

            <ProductGrid products={products} />
        </main>
    );
}