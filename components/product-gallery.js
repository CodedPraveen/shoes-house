"use client";

import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="group relative overflow-hidden no54123-[2rem] border border-black/5 bg-zinc-100"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <img
          src={images[activeIndex]}
          alt={name}
          className={`h-[420px] w-full object-cover transition duration-500 sm:h-[520px] ${
            zoom ? "scale-110" : "scale-100"
          }`}
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-20 w-20 shrink-0 overflow-hidden no54123-2xl border-2 transition ${
              activeIndex === index
                ? "border-black"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
