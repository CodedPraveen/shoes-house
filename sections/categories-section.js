import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import CategoryCarousel from "@/components/shoes/category-carousel";
export default function CategoriesSection({ categories = [], title = "Shop by lifestyle." }) {

  return (
    <SectionReveal id="categories" className="px-5 py-8 sm:px-8 lg:py-10" loading="lazy">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h2>
        </div>

        <CategoryCarousel categories={categories} />
      </div>
    </SectionReveal>
  );
}
