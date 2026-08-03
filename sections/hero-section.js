"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden px-5 pt-12 sm:px-0">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.06),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(0,0,0,0.07),transparent_32%),linear-gradient(#fff,#f7f7f7)]" />

      <div className="grid w-full items-center gap-12 py-8 ">
        <div className="relative">
          <img
            height={520}
            width={1400}
            src="/shoes/main-homeBanner.webp"
            alt="hero-section"
            className="w-full h-[660px] object-cover"
          />

          <h1 className="absolute inset-0 flex items-center justify-center text-[10vw] font-black uppercase text-white/20">
            <p className="bg- text-white/50">
              SHOES HOUSE
            </p>
          </h1>
        </div>
      </div>
    </section>
  );
}