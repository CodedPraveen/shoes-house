"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
                    {categories.map(({ slug, label, tone }) => (
                        <div
                            key={slug}
                            className="
                min-w-[50%]
                md:min-w-[33.333%]
                lg:min-w-[20%]
                px-3
              "
                        >
                            <Link
                                href={`/products?category=${slug}`}
                                className="group flex flex-col items-center gap-4"
                            >
                                <div
                                    className={cn(
                                        "aspect-square w-full overflow-hidden rounded-full border border-[#c5c7c1]/20 bg-gradient-to-br transition duration-500 group-hover:border-[#D4AF37]",
                                        tone
                                    )}
                                >
                                    <Image
                                        src={`/jewellery/${slug}.jpeg`}
                                        alt={label}
                                        width={250}
                                        height={250}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] sm:text-sm">
                                    {label}
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}