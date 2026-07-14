import Link from "next/link";
import Image from "next/image";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import CategoryCarousel from "./category-carousel";
import { JEWELLERY_CATEGORIES } from "@/data/jewellery-content";
import { cn } from "@/lib/utils";

export default function CategorySection() {
  return (
    <section aria-labelledby="jewellery-categories-heading" className="py-16 sm:py-20">
      <JewelleryContainer>
        <h2
          id="jewellery-categories-heading"
          className="mb-12 text-center font-[family-name:var(--font-jewellery-display)] text-2xl font-medium italic text-[#1b1b1c] sm:mb-20 sm:text-[32px]"
        >
          Shop by Category
        </h2>
       {/*  <ul className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-5">
          {JEWELLERY_CATEGORIES.map(({ slug, label, tone }) => (
            <li key={slug}>
              <Link
                href={`/products?category=${slug}`}
                className="group flex flex-col items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
              >
                <div
                  className={cn(
                    "aspect-square w-full overflow-hidden rounded-full border border-[#c5c7c1]/20 bg-gradient-to-br transition duration-500 group-hover:border-[#D4AF37]",
                    tone,
                  )}
                  aria-hidden="true"
                >
                  <Image src={`/jewellery/${slug}.jpeg`} alt="" width={200} height={200} className="h-full w-full object-cover" />
                    
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] sm:text-sm">
                  {label}
                </span>
              </Link>
            </li>
          ))} 
        </ul> */}
          <CategoryCarousel categories={JEWELLERY_CATEGORIES} />
      </JewelleryContainer>
    </section >
  );
}
