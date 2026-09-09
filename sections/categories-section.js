import SectionReveal from "@/components/section-reveal";
import CategoryCarousel from "@/components/shoes/category-carousel";
export default function CategoriesSection({ categories = [], title = "Shop by lifestyle." }) {

  return (
    <SectionReveal id="categories" className="border-t border-black/8 px-5 py-12 sm:px-8 sm:py-16 lg:py-24" loading="lazy">
      <div className="mx-auto w-full max-w-[1400px] space-y-8 sm:space-y-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">Find your pair</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-black/55 sm:text-base">
            Everyday essentials, performance silhouettes, and statement styles selected for the way you move.
          </p>
        </div>

        <CategoryCarousel categories={categories} />
      </div>
    </SectionReveal>
  );
}
