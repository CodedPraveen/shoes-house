"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";

export default function ProductCarousel({ products }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
    });

    return (
        <div className="relative">
            <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
            >
                <ChevronLeft size={18} />
            </button>

            <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
            >
                <ChevronRight size={18} />
            </button>

            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="
                min-w-[50%]
                md:min-w-[33.333%]
                lg:min-w-[25%]
                px-2
              "
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}