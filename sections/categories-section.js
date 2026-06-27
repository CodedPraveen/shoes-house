import Link from "next/link";
import SectionReveal from "@/components/section-reveal";
import { categories } from "@/data/products";
import CategoryCarousel from "@/components/catagories-carousel";

export default function CategoriesSection() {
  return (
    <SectionReveal id="categories" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="space-y-3">
          {/* <p className="text-xs uppercase tracking-[0.25em] text-black/45">
            Categories
          </p> */}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Shop by lifestyle.
          </h2>
        </div>
        {/* <div className="grid gap-5 grid-cols-2 lg:grid-cols-4 bg-blue-600"> */}
        <div className="bg-blue">
          <CategoryCarousel categories={categories} />
          {/* {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group relative block overflow-hidden no54123-3xl"
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/5" />
                <h3 className="absolute bottom-5 left-5 text-2xl font-medium text-white">
                  {category.title}
                </h3>
              </Link>
            ))} */}
          {/* <ProductCarousel
              items={categories}
              renderItem={(category) => (
                <Link
                  href={category.href}
                  className="group relative block overflow-hidden rounded-3xl"
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-72 w-full object-cover"
                  />

                  <h3 className="absolute bottom-5 left-5 text-white">
                    {category.title}
                  </h3>
                </Link>
              )}
            /> */}
        </div>
      </div>
    </SectionReveal>
  );
}
