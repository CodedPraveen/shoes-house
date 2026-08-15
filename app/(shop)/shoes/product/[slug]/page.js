import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { getCachedProductBySlug } from "@/lib/product-cache";

export const revalidate = 120;
export const metadata = { title: "Shoes & Footwear Online | Post Mart", description: "Shop men's, women's and kids' shoes online at Post Mart." };

export default async function ShoesProductPage({ params }) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug, "SHOES");
  if (!product) notFound();
  return <><ProductViewTracker productId={product.id} /><ProductDetailClient product={product} /></>;
}
