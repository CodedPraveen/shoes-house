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
  const activeImage = validImages[activeIndex] ?? validImages[0] ?? null;

  return (
    <div className="space-y-4">
      <div
        className="group relative overflow-hidden no54123-[2rem] border border-black/5 bg-zinc-100"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <SafeImage
          width={800}
          height={800}
          src={activeImage}
          alt={name}
          className={`h-105 w-full object-cover transition duration-500 sm:h-130 ${
            zoom ? "scale-110" : "scale-100"
          }`}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {validImages.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-20 w-20 shrink-0 overflow-hidden no54123-2xl border-2 transition ${
              activeIndex === index
                ? "border-black"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <SafeImage src={src} alt={`${name} view ${index + 1}`} width={80} height={80} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
