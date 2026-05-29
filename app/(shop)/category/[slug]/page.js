import { notFound } from "next/navigation";
import CatalogPageClient from "@/components/catalog-page-client";
import { CATEGORY_SLUGS } from "@/lib/constants";
import { productService } from "@/services/product-service";

const labels = {
  shoes: "Shoes",
  boys: "Boys",
  men: "Men",
  footwear: "Footwear",
};

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const label = labels[slug] ?? "Category";
  return {
    title: `${label} | AERÉ`,
    description: `Shop ${label.toLowerCase()} from AERÉ premium collection.`,
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  if (!CATEGORY_SLUGS.includes(slug)) {
    notFound();
  }

  const products = productService.getByCategory(slug);
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
