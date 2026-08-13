"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Replace these values to add, remove, or reorder homepage hero slides.
const HERO_SLIDES = [
  {
    id: "hero-1",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786548727/WhatsApp_Image_2026-08-07_at_11.01.54_AM.jpg",
    alt: "Hero banner 1",
    href: "/shoes/shoes-1",
  },
  {
    id: "hero-2",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786548890/WhatsApp_Image_2026-08-07_at_11.01.55_AM.jpg",
    alt: "Hero banner 2",
    href: "/shoes/shoes-1-1.png",
  },
  {
    id: "hero-3",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786549156/9b4f883c-b625-4369-889d-500e17a1b8fd.png",
    alt: "Hero banner 3",
    href: "/shoes/shoes-1-2.png",
  },
  {
    id: "hero-4",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786550507/288e7ec9-070a-4bc9-b337-1b1789dc7c2b.jpg",
    alt: "Hero campaign 4",
    href: "/shoes",
  },
  {
    id: "hero-5",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786550529/8fc723d9-fbb1-4751-b82d-05dfbedddfb4.jpg",
    alt: "Hero campaign 5",
    href: "/shoes",
  },
  {
    id: "hero-6",
    image: "https://res.cloudinary.com/rwuqhkyf/image/upload/v1786550532/3ecff149-a5eb-4f8a-b6a3-05d92e300fb5.jpg",
    alt: "Hero campaign 6",
    href: "/shoes",
  },
  // {
  //   id: "hero-7",
  //   image: "PASTE_IMAGE_URL_7_HERE",
  //   alt: "Hero campaign 7",
  //   href: "/shoes",
  // },
  // {
  //   id: "hero-8",
  //   image: "PASTE_IMAGE_URL_8_HERE",
  //   alt: "Hero campaign 8",
  //   href: "/shoes",
  // },
  // {
  //   id: "hero-9",
  //   image: "PASTE_IMAGE_URL_9_HERE",
  //   alt: "Hero campaign 9",
  //   href: "/shoes",
  // },
  // {
  //   id: "hero-10",
  //   image: "PASTE_IMAGE_URL_10_HERE",
  //   alt: "Hero campaign 10",
  //   href: "/shoes",
  // },
];

const AUTOPLAY_DELAY = 5000;
const isPlaceholder = (src) => src.startsWith("PASTE_IMAGE_URL_");
const passthroughLoader = ({ src }) => src;

export default function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: HERO_SLIDES.length > 1,
    align: "start",
    duration: 28,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const draggedRef = useRef(false);
  const pointerStartRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const resumeAutoplay = useCallback((delay = 900) => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setIsPaused(false), delay);
  }, []);

  const scrollPrev = useCallback(() => {
    setIsPaused(true);
    emblaApi?.scrollPrev();
    resumeAutoplay();
  }, [emblaApi, resumeAutoplay]);

  const scrollNext = useCallback(() => {
    setIsPaused(true);
    emblaApi?.scrollNext();
    resumeAutoplay();
  }, [emblaApi, resumeAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    const updateVisibility = () => setIsPageVisible(!document.hidden);

    updateMotionPreference();
    updateVisibility();
    mediaQuery.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (
      !emblaApi ||
      isPaused ||
      !isPageVisible ||
      prefersReducedMotion ||
      HERO_SLIDES.length < 2
    ) {
      return;
    }

    const autoplayTimer = window.setTimeout(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_DELAY);

    return () => window.clearTimeout(autoplayTimer);
  }, [emblaApi, isPageVisible, isPaused, prefersReducedMotion, selectedIndex]);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimerRef.current);
    },
    [],
  );

  const handlePointerDown = (event) => {
    window.clearTimeout(resumeTimerRef.current);
    setIsPaused(true);
    draggedRef.current = false;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event) => {
    const start = pointerStartRef.current;
    if (!start) return;

    const horizontalDistance = Math.abs(event.clientX - start.x);
    const verticalDistance = Math.abs(event.clientY - start.y);
    if (horizontalDistance > 8 && horizontalDistance > verticalDistance) {
      draggedRef.current = true;
    }
  };

  const handlePointerEnd = () => {
    pointerStartRef.current = null;
    resumeAutoplay();
  };

  const handleSlideClick = (event) => {
    if (draggedRef.current) {
      event.preventDefault();
      draggedRef.current = false;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollPrev();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollNext();
    }
  };

  return (
    <section
      aria-label="Featured collections"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => resumeAutoplay(400)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resumeAutoplay(400);
      }}
      className="group relative mt-20 w-full overflow-hidden bg-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-950"
    >
      <div
        ref={emblaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="overflow-hidden touch-pan-y select-none"
      >
        <div className="flex gap-2 lg:gap-2.5">
          {HERO_SLIDES.map((slide, index) => {
            const content = (
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-100">
                {isPlaceholder(slide.image) ? (
                  <div className="absolute inset-0 grid place-items-center bg-neutral-200">
                    <div className="mx-6 max-w-xs text-center text-neutral-950">
                      <p className="text-[0.6rem] font-medium uppercase tracking-[0.28em] text-neutral-500 sm:text-[0.65rem]">
                        Campaign image
                      </p>
                      <p className="mt-3 text-xs font-light leading-relaxed text-neutral-700 sm:text-sm">
                        Replace {slide.image} in HERO_SLIDES
                      </p>
                    </div>
                  </div>
                ) : (
                  <Image
                    loader={passthroughLoader}
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 85vw"
                    draggable={false}
                    className="pointer-events-none object-cover object-center"
                  />
                )}
              </div>
            );

            return (
              <div
                key={slide.id}
                // aria-roledescription=""
                aria-label={`${index + 1} of ${HERO_SLIDES.length}`}
                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_60%] lg:flex-[0_0_40%]"
              >
                {slide.href ? (
                  <Link
                    href={slide.href}
                    aria-label={`View ${slide.alt}`}
                    draggable={false}
                    onClick={handleSlideClick}
                    className="block cursor-grab active:cursor-grabbing"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>
      </div>

      {HERO_SLIDES.length > 1 ? (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Show previous hero slide"
            className="absolute left-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white opacity-0 backdrop-blur-md transition-[opacity,background-color,transform] duration-300 hover:scale-105 hover:bg-black/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex lg:left-6 lg:group-hover:opacity-100"
          >
            <ChevronLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Show next hero slide"
            className="absolute right-4 top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white opacity-0 backdrop-blur-md transition-[opacity,background-color,transform] duration-300 hover:scale-105 hover:bg-black/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:flex lg:right-6 lg:group-hover:opacity-100"
          >
            <ChevronRight aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-3 sm:bottom-4">
            <div
              role="progressbar"
              aria-label="Hero carousel progress"
              aria-valuemin={1}
              aria-valuemax={HERO_SLIDES.length}
              aria-valuenow={selectedIndex + 1}
              className="h-px w-24 overflow-hidden bg-white/45 shadow-[0_1px_2px_rgba(0,0,0,0.25)] sm:w-28"
            >
              <span
                className="block h-full origin-left bg-white transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{
                  transform: `scaleX(${(selectedIndex + 1) / HERO_SLIDES.length})`,
                }}
              />
            </div>
            <span className="min-w-11 text-[0.6rem] font-medium tabular-nums tracking-[0.14em] text-white drop-shadow-sm">
              {String(selectedIndex + 1).padStart(2, "0")} / {HERO_SLIDES.length}
            </span>
          </div>
        </>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Slide {selectedIndex + 1} of {HERO_SLIDES.length}
      </p>
    </section>
  );
}
