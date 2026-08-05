"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden mt-10 py-6 sm:py-8 lg:py-10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.06),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(0,0,0,0.07),transparent_32%),linear-gradient(#fff,#f7f7f7)]" />

      <div className="mx-auto w-full max-w-400 px-4 sm:px-0">
        <div className="relative overflow-hidden ">
          <Image
            src="/shoes/main-homeBanner.webp"
            alt="Post Mart Hero"
            width={1600}
            height={700}
            priority
            className="h-55 w-full object-cover sm:h-80 md:h-105 lg:h-140 xl:h-165"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-center text-4xl font-black uppercase tracking-wider text-white/60 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
              Post Mart
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}