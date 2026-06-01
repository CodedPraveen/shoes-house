"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";
import { calculateShipping } from "@/lib/shipping";
import { createCheckoutSessionAction } from "@/actions/checkout-actions";
import { getAddressesAction } from "@/actions/address-actions";

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
  "h-11 rounded-xl border border-black/15 bg-white px-4 text-sm outline-none ring-black/20 focus:ring-2";

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

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload =
      addressMode === "saved" && selectedAddressId
        ? { addressId: selectedAddressId }
        : { ...form };

    try {
      const result = await createCheckoutSessionAction(payload);
      if (!result.ok) {
        setError(result.error || "Could not start checkout");
        setLoading(false);
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
        name: "AERÉ",
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
      <div className="space-y-6 rounded-3xl border border-black/10 bg-zinc-50 p-6">
        <h2 className="text-lg font-medium">Shipping Address</h2>

        {savedAddresses.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-black/45">
              Address book
            </p>
            {savedAddresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                  addressMode === "saved" && selectedAddressId === addr.id
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
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Full name"
              className={inputClass}
              value={form.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
            />
            <input
              required
              placeholder="Phone"
              className={inputClass}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
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

      <section className="space-y-6 rounded-3xl border border-black/10 p-6">
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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Opening Razorpay…" : "Pay with Razorpay"}
        </button>
      </section>
    </form>
  );
}
