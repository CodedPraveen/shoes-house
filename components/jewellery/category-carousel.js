"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SafeImage from "../ui/safe-image";

export default function CategoryCarousel({ categories }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: true,
    });

    return (
        <div className="relative">
            <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg sm:hidden"
            >
                <ChevronLeft size={18} />
            </button>

            <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg sm:hidden"
            >
                <ChevronRight size={18} />
            </button>

            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="
      min-w-[60%]
      md:min-w-[33.333%]
      lg:min-w-[20%]
      px-3
    "
                        >
                            <Link
                                href={{
                                    pathname: "/jewellery",
                                    query: {
                                        category: category.slug,
                                    },
                                }}
                                className="group flex flex-col items-center gap-4"
                            >
                                <div
                                    className={cn(
                                        "aspect-square w-full overflow-hidden rounded-full border border-[#c5c7c1]/20 bg-gradient-to-br transition duration-500 group-hover:border-[#D4AF37]"
                                    )}
                                >
                                    <SafeImage
                                        src={`/jewellery/${category.slug}.jpeg`}
                                        // src={category.imageUrl || "/placeholder-category.jpg"}
                                        alt={category.name}
                                        width={250}
                                        height={250}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] sm:text-sm">
                                    {category.name}
                                </span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}