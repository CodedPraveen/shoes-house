"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Award, Droplets, Gem, ShieldCheck, ChevronLeft, ChevronRight, } from "lucide-react";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import { JEWELLERY_TRUST_ITEMS } from "@/data/jewellery-content";


export default function TrustStrip() {

  const ICONS = {
    droplets: Droplets,
    gem: Gem,
    "shield-check": ShieldCheck,
    award: Award,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  });

  return (
    <section
      aria-label="Product quality guarantees"
      className="border-y border-[#c5c7c1]/30 bg-[#FDFCFB] sm:py-10"
    >
      <JewelleryContainer>
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden lg:hidden">
            <div className="flex">
              {JEWELLERY_TRUST_ITEMS.map(({ icon, label }) => {
                const Icon = ICONS[icon];

                return (
                  <div
                    key={label}
                    className="
              min-w-[50%]
              sm:min-w-[33.333%]
              md:min-w-[25%]
              px-3
            "
                  >
                    <div className="flex flex-col items-center gap-3 text-center">
                      <Icon
                        className="h-8 w-8 text-[#D4AF37]"
                        strokeWidth={1.5}
                      />

                      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c]">
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
            {JEWELLERY_TRUST_ITEMS.map(({ icon, label }) => {
              const Icon = ICONS[icon];

              return (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <Icon
                    className="h-8 w-8 text-[#D4AF37]"
                    strokeWidth={1.5}
                  />

                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </JewelleryContainer>
    </section>
  );
}
