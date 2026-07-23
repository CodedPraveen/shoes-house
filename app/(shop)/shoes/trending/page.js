import ProductGrid from "@/components/product-grid";
import { productService } from "@/services/product-service";

export const metadata = {
    title: "Trending Jewellery",
};

export default async function JewelleryTrendingPage() {
    const products = await productService.getTrending(
        100,
        "JEWELLERY"
    );

    return (
        <main className="mx-auto max-w-[1280px] px-4 py-12 md:px-16">
            <h1 className="mb-8 text-3xl font-semibold">
                Trending Jewellery
            </h1>

            <ProductGrid products={products} />
        </main>
    );
}