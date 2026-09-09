"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SafeImage from "../ui/safe-image";

export default function CategoryCarousel({ categories }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: categories.length > 1,
    });

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Previous categories"
                className="absolute left-2 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-lg backdrop-blur transition hover:scale-105 sm:flex"
            >
                <ChevronLeft size={18} />
            </button>

            <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Next categories"
                className="absolute right-2 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/95 shadow-lg backdrop-blur transition hover:scale-105 sm:flex"
            >
                <ChevronRight size={18} />
            </button>

            <div ref={emblaRef} className="overflow-hidden">
                <div className="-mx-2 flex touch-pan-y">
                    {categories
                        .filter((category) => category?.slug)
                        .map((category) => (
                            <div
                                key={category.id}
                                className="
                min-w-[86%]
                sm:min-w-[48%]
                lg:min-w-[28%]
                xl:min-w-[24%]
                px-2
              "
                            >
                                {/* <Link
                                href={category.href}
                                className="group relative block overflow-hidden rounded-3xl"
                            > */}
                                <Link
                                    href={`/shoes?category=${category.slug}`}
                                    className="group relative block overflow-hidden rounded-[1.75rem] bg-neutral-100"
                                >
                                    <SafeImage
                                        // src={category.imageUrl || `/categories/${category.slug}.webp`}
                                        src={category.image}
                                        alt={category.name}
                                        width={500}
                                        height={500}
                                        sizes="(max-width: 640px) 86vw, (max-width: 1024px) 48vw, 28vw"
                                        className="h-80 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-96"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />

                                    <h3 className="absolute bottom-5 left-5 text-2xl font-medium text-white">
                                        {/* {category.title} */}
                                        {category.name}
                                    </h3>
                                </Link>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
