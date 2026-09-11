import { notFound } from "next/navigation";
import CatalogPageClient from "@/components/catalog-page-client";
import { categoryService } from "@/services/category-service";
import { productService } from "@/services/product-service";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await categoryService.getBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found | Post Mart",
    };
  }

  return {
    title: `${category.name} | Post Mart`,
    description: `Shop the ${category.name} collection at Post Mart.`,
  };
}


export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await categoryService.getBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await productService.getByCategory(slug);

  return (
    <CatalogPageClient
      eyebrow="Category"
      title={category.name}
      description={`Explore our ${category.name.toLowerCase()} collection — quiet luxury silhouettes for every pace.`}
      initialProducts={products}
      category={slug}
    />
  );
}
