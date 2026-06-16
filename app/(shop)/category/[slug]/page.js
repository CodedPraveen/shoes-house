import { notFound } from "next/navigation";
import CatalogPageClient from "@/components/catalog-page-client";
import { CATEGORY_SLUGS } from "@/lib/constants";
import { productService } from "@/services/product-service";

export const revalidate = 120;

const labels = {
  shoes: "Shoes",
  boys: "Boys",
  men: "Men",
  footwear: "Footwear",
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const label = labels[slug] ?? "Category";
  return {
    title: `${label} | Shoes House`,
    description: `Shop ${label.toLowerCase()} from Shoes House premium collection.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  if (!CATEGORY_SLUGS.includes(slug)) {
    notFound();
  }

  const products = await productService.getByCategory(slug);
  const label = labels[slug];

  return (
    <CatalogPageClient
      eyebrow="Category"
      title={label}
      description={`Explore our ${label.toLowerCase()} collection — quiet luxury silhouettes for every pace.`}
      initialProducts={products}
      category={slug}
    />
  );
}
