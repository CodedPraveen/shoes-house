"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoryCarousel({ categories }) {
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
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="
                min-w-[80%]
                sm:min-w-[50%]
                lg:min-w-[25%]
                px-2
              "
                        >
                            <Link
                                href={category.href}
                                className="group relative block overflow-hidden rounded-3xl"
                            >
                                <img
                                    src={category.image}
                                    alt={category.title}
                                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />

                                <h3 className="absolute bottom-5 left-5 text-2xl font-medium text-white">
                                    {category.title}
                                </h3>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}