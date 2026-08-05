import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { getCachedProductBySlug } from "@/lib/product-cache";

export const metadata = {
  title: "Shoes & Footwear Online at Best Prices | Post Cart",
  description:
    "Shop men's, women's and kids' shoes online. Explore sports shoes, sneakers, casual shoes, sandals and more with affordable prices and fast delivery across India.",
  keywords: [
    "shoes online",
    "footwear online",
    "men shoes",
    "women shoes",
    "kids shoes",
    "sports shoes",
    "casual shoes",
    "sneakers",
    "buy shoes online",
    "Post Cart"
  ],
};

export const revalidate = 120;


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
