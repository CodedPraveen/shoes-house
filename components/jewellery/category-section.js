import JewelleryContainer from "@/components/jewellery/jewellery-container";
import CategoryCarousel from "./category-carousel";
import { categoryService } from "@/services/category-service";

export default async function CategorySection() {
  const categories = await categoryService.getSubCategoriesBySlug("jewellery");
  // console.log(categories);

  return (
    <section
      aria-labelledby="jewellery-categories-heading"
      className="py-16 sm:py-10"
    >
      <JewelleryContainer>
        <h2
          id="jewellery-categories-heading"
          className="mb-12 text-center font-[family-name:var(--font-jewellery-display)] text-2xl font-medium italic text-[#1b1b1c] sm:mb-20 sm:text-[32px]"
        >
          Shop by Category
        </h2>

        <CategoryCarousel categories={categories} />
      </JewelleryContainer>
    </section>
  );
}