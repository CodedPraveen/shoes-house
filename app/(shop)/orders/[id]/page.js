"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGate from "@/components/auth-gate";
import PageHeader from "@/components/page-header";
import { formatPrice } from "@/lib/format-price";
import { Download } from "lucide-react";
import TrackingTimeline from "@/components/tracking-timeline";
import CustomerTrackingCard from "@/components/customer-tracking-card";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error("Order not found");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <AuthGate>
        <main className="pt-20">
          <PageHeader eyebrow="Order" title="Loading..." />
          <p className="px-5 text-sm text-black/60">Loading order details...</p>
        </main>
      </AuthGate>
    );
  }

  if (error || !order) {
    return (
      <AuthGate>
        <main className="pt-20">
          <PageHeader eyebrow="Order" title="Not found" />
          <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8">
            <p className="text-sm text-red-600">{error || "Order not found"}</p>
            <Link href="/orders" className="mt-4 inline-block text-sm text-blue-600 underline">
              Back to orders
            </Link>
          </div>
        </main>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <main className="pt-20">
        <PageHeader
          eyebrow="Order Details"
          title={order.orderNumber}
          description={`Ordered on ${new Date(order.createdAt).toLocaleDateString()}`}
        />
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-black/10 bg-zinc-50 p-6">
                <h2 className="text-lg font-medium">Shipping Address</h2>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-medium">{order.shipFullName}</p>
                  <p className="text-black/60">{order.shipLine1}</p>
                  {order.shipLine2 && <p className="text-black/60">{order.shipLine2}</p>}
                  <p className="text-black/60">
                    {order.shipCity}, {order.shipState} {order.shipPincode}
                  </p>
                  <p className="text-black/60">{order.shipCountry}</p>
                  <p className="text-black/60">Phone: {order.shipPhone}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white p-6">
                <h2 className="text-lg font-medium">Products</h2>
                <ul className="mt-6 space-y-4">
                  {order.items?.map((item) => (
                    <li key={item.id} className="flex gap-4 pb-4 border-b border-black/10 last:border-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="mt-1 text-sm text-black/60">
                          {item.color} · Size {item.size} · Qty {item.quantity}
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {formatPrice(item.priceAtPurchase * item.quantity)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="h-fit rounded-3xl border border-black/10 bg-zinc-50 p-6">
              <h2 className="text-lg font-medium">Order Summary</h2>
              <TrackingTimeline order={order} />
              <CustomerTrackingCard order={order} />

              <div className="mt-6 rounded-xs border border-black/10 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">
                  Tracking Details
                </h2>

                <p>
                  <strong>Tracking Number:</strong>{" "}
                  {order.trackingNumber || "-"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {order.trackingStatus || "-"}
                </p>

                <p>
                  <strong>Last Updated:</strong>{" "}
                  {order.lastTrackingSync
                    ? new Date(order.lastTrackingSync).toLocaleString("en-IN")
                    : "-"}
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Subtotal</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Shipping</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="border-t border-black/10 pt-3 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-black/10 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/60">Status</span>
                    <span className="capitalize font-medium">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/60">Payment</span>
                    <span className="text-black/60">
                      {order.payments?.some((p) => p.status === "COMPLETED")
                        ? "Paid"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/orders/${order.id}/invoice`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black/5"
                >
                  <Download size={16} />
                  Download Invoice
                </a>
              </div>
            </aside>
          </div>

          <Link href="/orders" className="mt-8 inline-block text-sm text-blue-600 underline">
            Back to all orders
          </Link>
        </div>
      </main>
    </AuthGate>
  );
}
