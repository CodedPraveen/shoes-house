"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Award, Droplets, Gem, ShieldCheck, ChevronLeft, ChevronRight,  } from "lucide-react";
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
        {/* <ul className="hidden gap-6 text-center md:grid md:grid-cols-4 md:gap-8">
          {JEWELLERY_TRUST_ITEMS.map(({ icon, label }) => {
            const Icon = ICONS[icon];
            return (
              <li key={label} className="flex flex-col items-center gap-3">
                <Icon
                  className="h-8 w-8 text-[#D4AF37]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] sm:text-sm">
                  {label}
                </span>
              </li>
            );
          })}
        </ul> */}
        <div className="relative">
          {/* <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg md:hidden"
          >
            <ChevronLeft size={18} />
          </button> */}
{/* 
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg md:hidden"
          > 
            <ChevronRight size={18} />
          </button>  
          */}

          <div ref={emblaRef} className="overflow-hidden">
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
