"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import { JEWELLERY_REVIEWS } from "@/data/jewellery-content";

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#c5c7c1]"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function ReviewSection() {

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
  });

  return (
    <SectionReveal className="py-16 sm:py-20">
      <JewelleryContainer>
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#575757]">
            Testimonials
          </p>
          <h2 className="font-[family-name:var(--font-jewellery-display)] text-2xl font-medium italic text-[#1b1b1c] sm:text-[32px]">
            Loved by Our Community
          </h2>
        </div>

        <>
          {/* Mobile & Tablet */}
          <div className="relative lg:hidden">

            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex">
                {JEWELLERY_REVIEWS.map(({ id, name, rating, text }) => (
                  <div
                    key={id}
                    className="min-w-full"
                  >
                    <div className="rounded-xl border border-[#c5c7c1]/30 bg-[#FDFCFB] p-5">
                      <StarRating rating={rating} />

                      <blockquote className="mt-4 text-sm leading-relaxed text-[#575757]">
                        &ldquo;{text}&rdquo;
                      </blockquote>

                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#1b1b1c]">
                        {name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop */}
          <ul className="hidden gap-6 lg:grid lg:grid-cols-3">
            {JEWELLERY_REVIEWS.map(({ id, name, rating, text }) => (
              <li
                key={id}
                className="rounded-xl border border-[#c5c7c1]/30 bg-[#FDFCFB] p-6 sm:p-8"
              >
                <StarRating rating={rating} />

                <blockquote className="mt-4 text-sm leading-relaxed text-[#575757] sm:text-base">
                  &ldquo;{text}&rdquo;
                </blockquote>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#1b1b1c]">
                  {name}
                </p>
              </li>
            ))}
          </ul>
        </>
      </JewelleryContainer>
    </SectionReveal>
  );
}
