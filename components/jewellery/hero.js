import Image from "next/image";
import HeroBanner from "@/public/jewellery/Main_banner_Desktop_1400x.webp";
import HeroMobile from "@/public/jewellery/necklaces.jpeg";
import SafeImage from "../ui/safe-image";
import { ScanFaceIcon } from "lucide-react";

export default function JewelleryHero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Responsive Height */}
      <div className="relative h-[45vh] min-h-[320px] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] xl:h-screen max-h-[900px]">

        <SafeImage
          src={HeroBanner}
          alt="Luxury Jewellery Collection"
          fill
          priority
          sizes="100vw"
          className="hidden md:block object-cover object-top"
        />

        <ScanFaceIcon
          src={HeroMobile}
          alt="Jewellery"
          fill
          priority
          className="block md:hidden object-cover object-bottom"
        />

        {/* Soft luxury overlay */}
        {/* <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/10 to-transparent" /> */}

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-[-2px] h-40 bg-gradient-to-t from-white via-white/40 to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-10 mt-5">
            <div className="max-w-xl text-white">
              <p className="mb-2 text-sm uppercase tracking-[0.35em] text-white/80">
                New Collection
              </p>

              <h1 className="text-4xl font-light leading-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Timeless
                <br />
                Elegance
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-white/90 sm:text-lg">
                Discover handcrafted jewellery designed for everyday luxury and
                unforgettable occasions.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button className="rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition hover:bg-neutral-200">
                  Shop Collection
                </button>
  
                  <button className="hidden sm:block rounded-full border border-white/70 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-black">
                    Explore
                  </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}