import Image from "next/image";
import HeroBanner from "@/public/jewellery/Main_banner_Desktop_1400x.webp";

export default function JewelleryHero() {
  return (
    <section className="relative min-h-[70vh] w-full overflow-hidden sm:min-h-[80vh] lg:min-h-[870px] pt-[1]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#f7e7ce]/40 via-[#fdfcfb] to-[#f0edee]" />
      <Image
        src={HeroBanner}
        alt="Everyday luxury jewellery editorial hero"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-90 transition duration-[10000ms] ease-out hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
    </section>
  );
}

// {/* 
//       <div className="relative flex h-full min-h-[70vh] flex-col justify-center px-4 py-20 sm:min-h-[80vh] md:px-16 lg:min-h-[870px]">
//         <div className="mx-auto w-full max-w-[1280px]">
//           <h1 className="font-[family-name:var(--font-jewellery-display)] text-4xl font-semibold tracking-tight text-[#1b1b1c] sm:text-5xl sm:leading-[1.1] lg:text-[48px]">
//             Everyday Luxury
//           </h1>
//           <p className="mt-4 max-w-md text-base leading-relaxed text-[#1b1b1c]/90 sm:text-lg">
//             Crafted to Shine. Discover timeless pieces designed to elevate your
//             everyday silhouette.
//           </p>
//           <Link
//             href="/products"
//             className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[#735c00] px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#735c00]/90 hover:shadow-xl active:scale-95"
//           >
//             Explore the Collection
//           </Link>
//         </div>
//       </div> */}