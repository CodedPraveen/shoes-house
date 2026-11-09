import PageHeader from "@/components/page-header";
import CheckoutClient from "@/components/checkout-client";

export default function CheckoutPage() {
  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Checkout"
        title="Complete your order"
        description="Secure payment via Razorpay. Stock is reduced only after payment verification."
      />
      <CheckoutClient />
    </main>
  );
}