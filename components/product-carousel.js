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
        <div className="relative w-full">
            {/* Previous */}
            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                className="
          absolute
          left-2
          top-1/2
          z-10
          flex
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-lg
          transition
          hover:scale-105
          active:scale-95
          sm:left-3
        "
                aria-label="Previous products"
            >
                <ChevronLeft size={18} />
            </button>

            {/* Next */}
            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                className="
          absolute
          right-2
          top-1/2
          z-10
          flex
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          bg-white
          shadow-lg
          transition
          hover:scale-105
          active:scale-95
          sm:right-3
        "
                aria-label="Next products"
            >
                <ChevronRight size={18} />
            </button>

            <div
                ref={emblaRef}
                className="overflow-hidden"
            >
                <div className="flex">
                    {validProducts.map((item) => (
                        <div
                            key={item.id}
                            className="
                w-[46%]
                min-w-0
                shrink-0
                px-1.5

                sm:w-[42%]
                sm:px-2

                md:w-1/3
                md:px-2

                lg:w-1/4
                lg:px-2

                xl:w-[23%]
              "
                        >
                            <ProductCard product={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}