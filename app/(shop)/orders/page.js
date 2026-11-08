import PageHeader from "@/components/page-header";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Orders"
        title="Order history"
        description="Track status and download invoices when available."
      />
      <div className="mx-auto max-w-3xl px-5 pb-20 text-sm text-black/70 sm:px-8">
        <p>Open the private link in your order confirmation email or WhatsApp message to view an order and download its invoice.</p>
        <Link href="/shoes" className="mt-5 inline-block underline">Continue shopping</Link>
      </div>
    </main>
  );
}
