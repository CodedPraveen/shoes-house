"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden px-5 pt-12 sm:px-0">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.06),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(0,0,0,0.07),transparent_32%),linear-gradient(#fff,#f7f7f7)]" />
      {/* <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 py-8 lg:grid-cols-2 lg:py-13">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
            className="space-y-8"
          >
            <span className="inline-flex no54123-full border border-black/10 bg-white/85 px-4 py-2 text-xs uppercase tracking-[0.25em] text-black/70">
              New Drop 2026
            </span>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Quiet luxury,
              <br />
              loud movement.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-black/65 sm:text-lg">
              Curated sneakers with modern craftsmanship, designed for daily life
              and elevated street expression.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/new-arrivals"
                className="no54123-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
              >
                Shop Collection
              </Link>
              <Link
                href="/#story"
                className="no54123-full border border-black/15 bg-white px-7 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Explore Story
              </Link>
            </div>        </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
            className="relative"
          >
            <div className="absolute -right-2 -top-3 z-10 no54123-full border border-black/15 bg-white/85 px-5 py-2 text-xs uppercase tracking-[0.18em] text-black/60 backdrop-blur">
              Limited Edition
            </div>
            <div className="overflow-hidden no54123-[2.5rem] border border-black/5 shadow-2xl shadow-black/10">
              <Image
                src="https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=1400&q=80"
                alt="Premium sneaker showcase"
                width={1400}
                height={520}
                quality={85}
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
            </div>
          </motion.div>
        </div> */}
      <div className="grid w-full items-center gap-12 py-8 ">
        <div className="relative">
          <img
            height={520}
            width={1400}
            src="https://cdn.cartpe.in/images/gallery_lg/37710ab12b80fdbc6fd133ffbeefe1f6.png"
            alt="hero-section"
            className="w-full h-[660px] object-cover"
          />

          <h1 className="absolute inset-0 flex items-center justify-center text-[10vw] font-black uppercase text-white/20">
            {/* <p className="bg-black text-white"> */}
            SHOES HOUSE
            {/* </p> */}
          </h1>
        </div>
      </div>
    </section>
  );

}

//   return (
//     <section className="relative min-h-screen overflow-hidden px-5 pt-12 sm:px-0">
//       <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_15%,rgba(0,0,0,0.06),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(0,0,0,0.07),transparent_32%),linear-gradient(#fff,#f7f7f7)]" />
//       <div className="mx-auto grid w-full max-w-[1400px] items-center gap-12 py-8 lg:grid-cols-2 lg:py-20">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.75, ease: [0.25, 1, 0.5, 1] }}
//           className="space-y-8"
//         >
//           <span className="inline-flex rounded-full border border-black/10 bg-white/85 px-4 py-2 text-xs uppercase tracking-[0.25em] text-black/70">
//             New Drop 2026
//           </span>
//           <h1 className="max-w-xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
//             Quiet luxury,
//             <br />
//             loud movement.
//           </h1>
//           <p className="max-w-lg text-base leading-relaxed text-black/65 sm:text-lg">
//             Curated sneakers with modern craftsmanship, designed for daily life
//             and elevated street expression.
//           </p>
//           <div className="flex flex-wrap gap-4">
//             <Link
//               href="/new-arrivals"
//               className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
//             >
//               Shop Collection
//             </Link>
//             <Link
//               href="/#story"
//               className="rounded-full border border-black/15 bg-white px-7 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
//             >
//               Explore Story
//             </Link>
//           </div>        </motion.div>

//       <div className="grid w-full items-center gap-12 py-8">
//         <div className="relative">
//           <img
//             height={520}
//             width={1400}
//             src="https://cdn.cartpe.in/images/gallery_lg/37710ab12b80fdbc6fd133ffbeefe1f6.png"
//             alt="hero-section"
//             className="w-full h-[660px] object-cover"
//           />

//           <h1 className="absolute inset-0 flex items-center justify-center text-[10vw] font-black uppercase text-white/50 pb-[70]">
//             SHOES HOUSE
//           </h1>
//         </div>
//       </div>
//       </div>
//     </section>
//   );

// }

