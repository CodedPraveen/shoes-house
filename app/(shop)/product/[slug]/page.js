import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { productService } from "@/services/product-service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);
  if (!product) return { title: "Product | Shoes House" };

  return {
    title: `${product.name} | Shoes House`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await productService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await productService.getRelatedBySlug(slug, 4);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
