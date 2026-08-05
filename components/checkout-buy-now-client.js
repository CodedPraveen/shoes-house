"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format-price";
import { calculateShipping } from "@/lib/shipping";
import { createBuyNowCheckoutSessionAction } from "@/actions/checkout-actions";
import { getAddressesAction } from "@/actions/address-actions";
import { reverseGeocodeAction } from "@/actions/geocode-actions";
import LoadingButton from "@/components/ui/loading-button";
import { useUser } from "@clerk/nextjs";
import SafeImage from "./ui/safe-image";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const inputClass =
  "h-11 no54123-xl border border-black/15 bg-white px-4 text-sm outline-none ring-black/20 focus:ring-2";


const emptyForm = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

export default function CheckoutBuyNowClient({ lineItem }) {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const quantity = Number(searchParams.get("quantity") || 1);

  const subtotal = lineItem.price * quantity;
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost;

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("saved");
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showLocationWarning, setShowLocationWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName:
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    }));
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getAddressesAction();
        setSavedAddresses(rows);
        if (rows.length > 0) {
          const def = rows.find((a) => a.isDefault) ?? rows[0];
          setSelectedAddressId(def.id);
          setForm({
            fullName: def.fullName,
            phone: def.phone,
            line1: def.line1,
            line2: def.line2 || "",
            city: def.city,
            state: def.state,
            country: def.country,
            pincode: def.pincode,
          });
          setAddressMode("saved");
        } else {
          setAddressMode("new");
        }
      } catch {
        setAddressMode("new");
      }
    })();
  }, []);

  if (!productId || !color || !size || !lineItem) {
    return (
      <p className="text-sm text-black/60">
        Invalid buy-now link.{" "}
        <a href="/products" className="underline">
          Browse products
        </a>
      </p>
    );
  }

  async function handlePay(e) {
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }
    e.preventDefault();
    setError("");
    setLoading(true);

    const addressPayload =
      addressMode === "saved" && selectedAddressId
        ? { addressId: selectedAddressId }
        : { ...form };

    try {
      const result = await createBuyNowCheckoutSessionAction({
        ...addressPayload,
        productId,
        color,
        size,
        quantity,
        paymentMethod,
      });

      if (!result.ok) {
        setError(result.error || "Could not start checkout");
        setLoading(false);
        return;
      }

      if (paymentMethod === "cod") {
        router.push(`/orders/${result.orderId}?status=confirmed`);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Could not load payment gateway");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: result.keyId,
        amount: result.amount * 100,
        currency: result.currency,
        name: "Post Mart",
        description: "Buy Now",
        order_id: result.razorpayOrderId,
        prefill: {
          name: result.user.name,
          email: result.user.email,
          contact: result.user.contact,
        },
        theme: { color: "#111111" },
        handler() {
          router.push("/orders?status=processing");
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. You can try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Checkout error");
    } finally {
      setLoading(false);
    }
  }

  const success = async (pos) => {
    try {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;


      const addr = await reverseGeocodeAction(lat, lng);

      setAddressMode("new");

      setForm((prev) => ({
        ...prev,
        ...addr,
        country: addr.country || "India",
      }));
      setShowLocationWarning(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to get address");
    } finally {
      setLocating(false);
    }
  };

  const erro = (err) => {
    console.error(err);

    alert(
      "Location unavailable or permission denied. Please fill the address manually."
    );

    setError(
      "Location unavailable or permission denied. Please fill the address manually."
    );

    setLocating(false);
  };


  return (
    <form
      onSubmit={handlePay}
      className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-2"
    >
      <div className="space-y-6 no54123-3xl border border-black/10 bg-zinc-50 p-6">
        <h2 className="text-lg font-medium">Shipping Address</h2>
        <p className="text-xs text-black/45">Buy Now — cart is not modified</p>
        {(addressMode === "new" || savedAddresses.length === 0) && (
          <LoadingButton
            type="button"
            loading={locating}
            onClick={async () => {
              setLocating(true);

              navigator.geolocation.getCurrentPosition(
                success,
                erro,
                {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 0,
                }
              );
            }}
            className="no54123-full border border-black/15 px-4 py-2 text-xs"
          >
            Use my location
          </LoadingButton>
        )}
        {showLocationWarning && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <strong>Location detected.</strong> Your address may not be completely
            accurate. Please verify and update it before placing your order.
          </div>
        )}
        {(addressMode === "new" || savedAddresses.length === 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            <input required placeholder="Full name" className={inputClass} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} placeholder="Phone" className={inputClass} value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);

                setForm({
                  ...form,
                  phone: value,
                });
              }}
            />
            <input required placeholder="House No / Flat No / Landmark" className={`${inputClass} sm:col-span-2`} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
            <input required placeholder="Address line 1" className={`${inputClass} sm:col-span-2`} value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
            <input required placeholder="City" className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input required placeholder="State" className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input required placeholder="PIN code" className={inputClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
        )}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
      <section className="space-y-6 no54123-3xl border border-black/10 p-6">
        <h2 className="text-lg font-medium">Order Summary</h2>
        <div className="flex gap-4">
          <div className="relative h-24 w-24 overflow-hidden border">
            <SafeImage
              src={lineItem.image}
              alt={lineItem.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-medium">{lineItem.name}</h3>

            <p className="text-sm text-black/60">
              Color: {color}
            </p>

            <p className="text-sm text-black/60">
              Size: {size}
            </p>

            <p className="text-sm text-black/60">
              Qty: {quantity}
            </p>
          </div>
        </div>
        <div className="space-y-2 border-t border-black/10 pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {shippingCost === 0
                ? "Free"
                : formatPrice(shippingCost)}
            </span>
          </div>

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <div className="space-y-3 border-t border-black/10 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Pay Online (Razorpay)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Cash on Delivery</span>
          </label>
        </div>
        <LoadingButton
          type="submit"
          loading={loading}
          className="w-full no54123-full bg-black py-3 text-sm font-medium text-white"
        >
          {paymentMethod === "cod"
            ? "Place Order"
            : "Pay with Razorpay"}
        </LoadingButton>
      </section>
    </form>
  );
}
