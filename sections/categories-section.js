import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import CategoryCarousel from "@/components/shoes/category-carousel";
import { categoryService } from "@/services/category-service";

export default async function CategoriesSection() {
  const categories = await categoryService.getSubCategoriesBySlug("shoes");

  return (
    <SectionReveal id="categories" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Shop by lifestyle.
          </h2>
        </div>

        <CategoryCarousel categories={categories} />
      </div>
    </SectionReveal>
  );
}