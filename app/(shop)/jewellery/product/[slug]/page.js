import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { getCachedProductBySlug } from "@/lib/product-cache";

export const revalidate = 120;
export const metadata = { title: "Jewellery Online | Post Mart", description: "Shop the Post Mart jewellery collection." };

export default async function JewelleryProductPage({ params }) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug, "JEWELLERY");
  if (!product) notFound();
  return <><ProductViewTracker productId={product.id} /><ProductDetailClient product={product} /></>;
}
