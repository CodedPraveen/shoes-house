"use client";

import { Suspense } from "react";
import PageHeader from "@/components/page-header";
import OrdersClient from "@/components/orders-client";

export default function OrdersPage() {
  return (
    <main className="pt-20">
      <PageHeader
        eyebrow="Orders"
        title="Order history"
        description="Track status and download invoices when available."
      />
      <Suspense fallback={<p className="px-5 text-sm text-black/60">Loading…</p>}>
        <OrdersClient />
      </Suspense>
    </main>
  );
}