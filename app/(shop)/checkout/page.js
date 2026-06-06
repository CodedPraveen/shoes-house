"use client";

import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import CheckoutClient from "@/components/checkout-client";

export default function CheckoutPage() {
  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Checkout"
          title="Complete your order"
          description="Secure payment via Razorpay. Stock is reduced only after payment verification."
        />
        <CheckoutClient />
      </main>
    </AuthGate>
  );
}
