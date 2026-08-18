"use client";

import { useState } from "react";
import SafeImage from "@/components/ui/safe-image";
import { validateProductImageUrl } from "@/lib/product-image";

export default function ProductGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const validImages = (Array.isArray(images) ? images : [])
    .map((src) => validateProductImageUrl(src))
    .filter((image) => image.isValid)
    .map((image) => image.url);

  const activeImage =
    validImages[activeIndex] ?? validImages[0] ?? null;

  const handlePrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? validImages.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) =>
      current === validImages.length - 1 ? 0 : current + 1,
    );
  };

  if (!activeImage) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-3xl border border-black/5 bg-zinc-100 sm:rounded-[2rem]">
        <div className="flex h-full items-center justify-center text-sm text-black/40">
          No product image
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* =========================
          MAIN IMAGE
      ========================== */}
      <div
        className="group relative aspect-square w-full overflow-hidden rounded border border-black/5 bg-zinc-100 sm:rounded-[2rem]"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <SafeImage
          width={1000}
          height={1000}
          src={activeImage}
          alt={name}
          priority
          className={`h-full w-full object-contain transition duration-500 ${
  zoom ? "scale-105" : "scale-100"
} `}
        />

        {/* Previous */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl shadow-sm backdrop-blur-sm transition hover:bg-white sm:left-4 sm:h-10 sm:w-10"
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* Next */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/90 text-xl shadow-sm backdrop-blur-sm transition hover:bg-white sm:right-4 sm:h-10 sm:w-10"
            aria-label="Next image"
          >
            ›
          </button>
        )}

        {/* Mobile image counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 sm:hidden">
            {validImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${ index + 1 } `}
                className={`h - 1.5 rounded - full transition - all ${
  activeIndex === index
    ? "w-4 bg-black"
    : "w-1.5 bg-black/20"
} `}
              />
            ))}
          </div>
        )}
      </div>

      {/* =========================
          THUMBNAILS
      ========================== */}
      {validImages.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:gap-3">
          {validImages.map((src, index) => (
            <button
              key={`${ src } -${ index } `}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h - 16 w - 16 shrink - 0 overflow - hidden rounded - xl border - 2 bg - zinc - 100 transition sm: h - 20 sm: w - 20 sm: rounded - 2xl ${
  activeIndex === index
    ? "border-black"
    : "border-transparent opacity-60 hover:opacity-100"
} `}
              aria-label={`View ${ name } image ${ index + 1 } `}
              aria-current={
                activeIndex === index ? "true" : undefined
              }
            >
              <SafeImage
                src={src}
                alt={`${ name } view ${ index + 1 } `}
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />

              {/* Active thumbnail overlay */}
              {activeIndex === index && (
                <span className="absolute inset-0 rounded-[inherit] ring-1 ring-black/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
