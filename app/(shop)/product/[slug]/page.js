import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/product-detail-client";
import ProductViewTracker from "@/components/product-view-tracker";
import { getCachedProductBySlug } from "@/lib/product-cache";

export const metadata = {
  title: "Products | Shoes House",
  description: "Explore our collection of high-quality shoes for every occasion. Find the perfect pair that matches your style and needs.",
};

export const revalidate = 120;


export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`;

  const whatsappNumber = "919166869035"; // apna number

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hi, I'm interested in this product.

Product: ${product.name}
Price: ₹${product.price}

Link: ${productUrl}`
  )}`;  

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <ProductDetailClient product={product} />
      <button
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        WhatsApp Inquiry
      </button>
    </>
  );
}
