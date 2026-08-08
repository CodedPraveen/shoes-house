import { Suspense } from "react";
import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import CheckoutBuyNowClient from "@/components/checkout-buy-now-client";
import { productService } from "@/services/product-service";
import { notFound } from "next/navigation";

export const metadata = { title: "Buy Now | Post Mart" };

export default async function BuyNowCheckoutPage({ searchParams }) {
  const params = await searchParams;
  const productId = params.productId;
  const size = params.size;

  if (!productId || !size) {
    notFound();
  }

  const product = await productService.getById(productId);
  if (!product) notFound();

  const lineItem = {
    name: product.name,
    price: product.price,
    image: product.image,
    defaultColor: product.colors[0]?.id || "",
  };

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Buy Now"
          title="Complete your purchase"
          description="Single-item checkout — your cart stays unchanged."
        />
        <Suspense fallback={<p className="px-5 text-sm text-black/60">Loading…</p>}>
          <CheckoutBuyNowClient lineItem={lineItem} />
        </Suspense>
      </main>
    </AuthGate>
  );
}
