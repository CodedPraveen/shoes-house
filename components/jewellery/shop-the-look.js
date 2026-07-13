"use client";

import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import {
  JEWELLERY_PLACEHOLDER,
  SHOP_THE_LOOK_HOTSPOTS,
} from "@/data/jewellery-content";
import { cn } from "@/lib/utils";

function Hotspot({ top, left, title, price, align = "left", delay = "0s" }) {
  return (
    <div
      className="absolute z-30 group/hotspot"
      style={{ top, left }}
    >
      <button
        type="button"
        aria-label={`View ${title}`}
        className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
      >
        <span
          className="absolute inset-0 animate-ping rounded-full bg-white/50"
          style={{ animationDuration: "2s", animationDelay: delay }}
          aria-hidden="true"
        />
        <span className="h-2 w-2 rounded-full bg-[#D4AF37]" aria-hidden="true" />
      </button>

      <div
        className={cn(
          "pointer-events-none absolute top-1/2 w-44 -translate-y-1/2 rounded-lg bg-white p-4 opacity-0 shadow-xl transition-opacity group-hover/hotspot:opacity-100 group-focus-within/hotspot:opacity-100",
          align === "right" ? "right-8" : "left-8",
        )}
      >
        <p className="text-xs font-bold text-[#1b1b1c]">{title}</p>
        <p className="mb-2 text-[10px] text-[#575757]">{price}</p>
        <Link
          href="/products"
          className="pointer-events-auto text-[10px] uppercase tracking-tight text-[#D4AF37]"
        >
          View Item
        </Link>
      </div>
    </div>
  );
}

export default function ShopTheLook() {
  return (
    <SectionReveal className="py-16 sm:py-20">
      <JewelleryContainer>
        <h2 className="mb-8 text-center font-[family-name:var(--font-jewellery-display)] text-2xl font-medium italic text-[#1b1b1c] sm:mb-10 sm:text-[32px]">
          Shop The Look
        </h2>

        <div className="group relative overflow-hidden rounded-2xl">
          <div className="relative h-[420px] sm:h-[560px] lg:h-[700px]">
            <Image
              src={JEWELLERY_PLACEHOLDER}
              alt="Curated jewellery look with interactive product hotspots"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
            />
          </div>

          {SHOP_THE_LOOK_HOTSPOTS.map((spot) => (
            <Hotspot key={spot.id} {...spot} />
          ))}
        </div>
      </JewelleryContainer>
    </SectionReveal>
  );
}
