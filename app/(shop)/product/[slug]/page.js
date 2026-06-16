import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { getCachedProductBySlug } from "@/lib/product-cache";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) return { title: "Product | Shoes House" };

  return {
    title: `${product.name} | Shoes House`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetailClient product={product} />
    </>
  );
}
