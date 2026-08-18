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
      current === 0
        ? validImages.length - 1
        : current - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) =>
      current === validImages.length - 1
        ? 0
        : current + 1,
    );
  };

  if (!activeImage) {
    return (
      <div className="w-full aspect-[2/3] overflow-hidden rounded border border-black/5 bg-zinc-100 sm:rounded-2xl lg:rounded-3xl">
        <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
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
        className="
          group
          relative
          w-full
          aspect-[2/3]
          overflow-hidden
          rounded
          border
          border-black/5
          bg-zinc-100
          sm:rounded-2xl
          lg:rounded-3xl
        "
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <SafeImage
          width={800}
          height={1200}
          src={activeImage}
          alt={name}
          priority
          className={`
            absolute
            inset-0
            h-full
            w-full
            object-contain
            object-center
            p-0
            transition-transform
            duration-500
            ease-out
            sm:p-0
            ${zoom
              ? "scale-105"
              : "scale-100"
            }
          `}
        />

        {/* =========================
            PREVIOUS BUTTON
        ========================== */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handlePrevious}
            className="
              absolute
              left-2
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white/90
              text-xl
              text-black
              shadow-sm
              backdrop-blur-sm
              transition
              hover:bg-white
              active:scale-95
              sm:left-4
              sm:h-10
              sm:w-10
            "
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        {/* =========================
            NEXT BUTTON
        ========================== */}
        {validImages.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="
              absolute
              right-2
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white/90
              text-xl
              text-black
              shadow-sm
              backdrop-blur-sm
              transition
              hover:bg-white
              active:scale-95
              sm:right-4
              sm:h-10
              sm:w-10
            "
            aria-label="Next image"
          >
            ›
          </button>
        )}

        {/* =========================
            MOBILE DOTS
        ========================== */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 sm:hidden">
            {validImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={
                  activeIndex === index
                    ? "true"
                    : undefined
                }
                className={`
                  h-1.5
                  rounded-full
                  transition-all
                  ${activeIndex === index
                    ? "w-4 bg-black"
                    : "w-1.5 bg-black/25"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* =========================
          THUMBNAILS
      ========================== */}
      {validImages.length > 1 && (
        <div
          className="
            flex
            w-full
            gap-2
            overflow-x-auto
            pb-1
            scrollbar-none
            sm:gap-3
          "
        >
          {validImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`
                relative
                aspect-[2/3]
                w-16
                shrink-0
                overflow-hidden
                rounded
                border-2
                bg-zinc-100
                transition
                sm:w-20
                sm:rounded-xl
                lg:w-24
                ${activeIndex === index
                  ? "border-black"
                  : "border-transparent opacity-60 hover:opacity-100"
                }
              `}
              aria-label={`View ${name} image ${index + 1}`}
              aria-current={
                activeIndex === index
                  ? "true"
                  : undefined
              }
            >
              <SafeImage
                src={src}
                alt={`${name} view ${index + 1}`}
                width={160}
                height={240}
                className="h-full w-full object-cover"
              />

              {activeIndex === index && (
                <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}