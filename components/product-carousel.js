"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { hasValidProductImages } from "@/lib/product-image";

export default function ProductCarousel({ products = [] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
    });

    const validProducts = products.filter((item) =>
        hasValidProductImages(item),
    );

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
                aria-label="Previous products"
            >
                <ChevronLeft size={18} />
            </button>

            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
                aria-label="Next products"
            >
                <ChevronRight size={18} />
            </button>

            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {validProducts.map((item) => (
                        <div
                            key={item.id}
                            className="min-w-[50%] px-2 md:min-w-[33.333%] lg:min-w-[25%]"
                        >
                            <ProductCard product={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}