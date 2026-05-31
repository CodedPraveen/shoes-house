import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { productService } from "@/services/product-service";
import { products } from "@/data/catalog";

export async function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = productService.getById(id);
  if (!product) return { title: "Product | AERÉ" };

  return {
    title: `${product.name} | AERÉ`,
    description: product.description,
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = productService.getById(id);

  if (!product) {
    notFound();
  }

  const related = productService.getRelated(id, 4);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
