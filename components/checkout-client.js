"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";
import { calculateShipping } from "@/lib/shipping";
import { createCheckoutSessionAction } from "@/actions/checkout-actions";
import { getAddressesAction } from "@/actions/address-actions";
import { reverseGeocodeAction } from "@/actions/geocode-actions";
import LoadingButton from "@/components/ui/loading-button";
import { useUser } from "@clerk/nextjs";


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

function addressToForm(a) {
  return {
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 || "",
    city: a.city,
    state: a.state,
    country: a.country,
    pincode: a.pincode,
  };
}

export default function CheckoutClient() {
  const { user } = useUser();
  const router = useRouter();
  const { items, subtotal } = useCart();
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

  useEffect(() => {
    (async () => {
      try {
        const rows = await getAddressesAction();
        setSavedAddresses(rows);
        if (rows.length > 0) {
          const def = rows.find((a) => a.isDefault) ?? rows[0];
          setSelectedAddressId(def.id);
          setForm(addressToForm(def));
          setAddressMode("saved");
        } else {
          setAddressMode("new");
        }
      } catch {
        setAddressMode("new");
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    setForm((prev) => ({
      ...prev,
      fullName:
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    }));
  }, [user]);


  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectSavedAddress(id) {
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setSelectedAddressId(id);
    setForm(addressToForm(addr));
  }

  function switchToNewAddress() {
    setAddressMode("new");
    setSelectedAddressId(null);
    setForm(emptyForm);
  }

  async function useMyLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const addr = await reverseGeocodeAction(
            position.coords.latitude,
            position.coords.longitude,
          );
          setAddressMode("new");
          setSelectedAddressId(null);
          setForm((prev) => ({
            ...prev,
            line1: addr.line1 || prev.line1,
            line2: addr.line2 || prev.line2,
            city: addr.city || prev.city,
            state: addr.state || prev.state,
            country: addr.country || "India",
            pincode: addr.pincode || prev.pincode,
          }));
        } catch (err) {
          setError(err.message || "Could not detect address");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Location permission denied or unavailable.");
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 15000 },
    );
  }

  async function handlePay(e) {
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload =
      addressMode === "saved" && selectedAddressId
        ? { addressId: selectedAddressId }
        : { ...form };

    try {
      const result = await createCheckoutSessionAction({
        ...payload,
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

      const options = {
        key: result.keyId,
        amount: result.amount * 100,
        currency: result.currency,
        name: "Post Mart",
        description: "Premium sneakers",
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
        modal: {
          ondismiss() {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
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

  if (!items.length) {
    return (
      <p className="text-sm text-black/60">
        Your cart is empty.{" "}
        <a href="/products" className="underline">
          Continue shopping
        </a>
      </p>
    );
  }

  return (
    <form
      onSubmit={handlePay}
      className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-2"
    >
      <div className="space-y-6 no54123-3xl border border-black/10 bg-zinc-50 p-6">
        <h2 className="text-lg font-medium">Shipping Address</h2>

        {savedAddresses.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-black/45">
              Address book
            </p>
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer gap-3 no54123-2xl border p-4 transition ${addressMode === "saved" && selectedAddressId === addr.id
                  ? "border-black bg-white"
                  : "border-black/10 bg-white/60"
                  }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-1"
                  checked={
                    addressMode === "saved" && selectedAddressId === addr.id
                  }
                  onChange={() => {
                    setAddressMode("saved");
                    selectSavedAddress(addr.id);
                  }}
                />
                <span className="text-sm text-black/80">
                  <span className="font-medium text-black">
                    {addr.fullName}
                    {addr.isDefault ? (
                      <span className="ml-2 text-xs text-black/45">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <br />
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ""}
                  <br />
                  {addr.city}, {addr.state} {addr.pincode}
                  <br />
                  {addr.phone}
                </span>
              </label>
            ))}
            <button
              type="button"
              onClick={switchToNewAddress}
              className="text-xs underline text-black/60"
            >
              Use a different address
            </button>
          </div>
        ) : null}

        {(addressMode === "new" || savedAddresses.length === 0) && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <LoadingButton
                type="button"
                loading={locating}
                onClick={useMyLocation}
                className="no54123-full border border-black/15 px-4 py-2 text-xs"
              >
                Use my location
              </LoadingButton>
              <span className="text-xs text-black/45">or enter address manually</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
           
              <input required placeholder="Full name" className={inputClass} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

              <input
                required
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="Phone"
                className={inputClass}
                value={form.phone}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value.replace(/\D/g, "").slice(0, 10)
                  )
                }
              />
              <input
                required
                placeholder="Address line 1"
                className={`${inputClass} sm:col-span-2`}
                value={form.line1}
                onChange={(e) => updateField("line1", e.target.value)}
              />
              <input
                placeholder="Address line 2"
                className={`${inputClass} sm:col-span-2`}
                value={form.line2}
                onChange={(e) => updateField("line2", e.target.value)}
              />
              <input
                required
                placeholder="City"
                className={inputClass}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
              <input
                required
                placeholder="State"
                className={inputClass}
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />
              <input
                required
                placeholder="PIN code"
                className={inputClass}
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
              />
            </div>
          </div>
        )}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-black/50">
          Payment is confirmed via secure webhook only. Your order appears after
          verification (usually within a minute). Manage addresses on your{" "}
          <a href="/profile" className="underline">
            profile
          </a>
          .
        </p>
      </div>

      <section className="space-y-6 no54123-3xl border border-black/10 p-6">
        <h2 className="text-lg font-medium">Order Summary</h2>
        <ul className="space-y-3 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="text-black/70">
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingCost === 0 ? "Free" : formatPrice(shippingCost)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <div className="space-y-3 border-t border-black/10 pt-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>Pay Online (Razorpay)</span>
          </label>

          <label className="flex items-center gap-2">
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
        <button
          type="submit"
          disabled={loading}
          className="w-full no54123-full bg-black py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading
            ? paymentMethod === "cod"
              ? "Placing Order..."
              : "Opening Razorpay..."
            : paymentMethod === "cod"
              ? "Place Order"
              : "Pay with Razorpay"}
        </button>
      </section>
    </form>
  );
}
