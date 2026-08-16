"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/format-price";
import { calculateShipping } from "@/lib/shipping";
import {
  createCheckoutSessionAction,
  verifyRazorpayPaymentAction,
} from "@/actions/checkout-actions";
import { getAddressesAction } from "@/actions/address-actions";
import GoogleLocationPicker from "@/components/google-location-picker";
import { useUser } from "@clerk/nextjs";
import AddressFields from "@/components/address-fields";
import {
  firstAddressError,
  mergeGeocodedAddress,
  validateAddressInput,
} from "@/lib/address-validation";


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

const emptyForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  landmark: "",
  line2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

function addressToForm(a) {
  return {
    label: a.label || "Home",
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    landmark: a.landmark || "",
    line2: a.line2 || "",
    city: a.city,
    state: a.state,
    country: a.country,
    pincode: a.pincode,
  };
}
export default function CheckoutClient() {
  const { user } = useUser();
  const customerName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
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
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const touchedFieldsRef = useRef(new Set());

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
    touchedFieldsRef.current.add(key);
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function selectSavedAddress(id) {
    const addr = savedAddresses.find((a) => a.id === id);
    if (!addr) return;
    setSelectedAddressId(id);
    setForm(addressToForm(addr));
    touchedFieldsRef.current.clear();
    setFieldErrors({});
    setSelectedCoordinates(null);
    setShowLocationWarning(false);
  }

  function switchToNewAddress() {
    setAddressMode("new");
    setSelectedAddressId(null);
    setForm({ ...emptyForm, fullName: customerName });
    touchedFieldsRef.current.clear();
    setFieldErrors({});
    setSelectedCoordinates(null);
    setShowLocationWarning(false);
  }

  function handleLocationConfirmed({ address, coordinates }) {
    setError("");
    setAddressMode("new");
    setSelectedAddressId(null);
    setSelectedCoordinates(coordinates);
    setForm((previous) =>
      mergeGeocodedAddress(previous, address, touchedFieldsRef.current),
    );
    setShowLocationWarning(true);
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");

    const validation = validateAddressInput({
      ...form,
      fullName: form.fullName || customerName,
    });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError(firstAddressError(validation.errors));
      return;
    }

    setFieldErrors({});
    setLoading(true);

    const payload =
      addressMode === "saved" && selectedAddressId
        ? { addressId: selectedAddressId }
        : { ...form, fullName: form.fullName || customerName };

    try {
      const result = await createCheckoutSessionAction({
        ...payload,
        paymentMethod,
        saveShippingAddress: addressMode === "new" && saveAddress,
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
        async handler(response) {
          setLoading(true);
          setError("");

          const persisted = await verifyRazorpayPaymentAction({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          if (persisted.ok) {
            router.push(`/orders/${persisted.orderId}?status=confirmed`);
            return;
          }

          setError(
            persisted.error ||
              "Payment was received, but the order is still being confirmed. Please check My Orders before retrying.",
          );
          setLoading(false);
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
        <a href="/shoes/products" className="underline">
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
                    {addr.label || "Home"} · {addr.fullName}
                    {addr.isDefault ? (
                      <span className="ml-2 text-xs text-black/45">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <br />
                  {addr.line1}
                  {addr.landmark ? `, ${addr.landmark}` : ""}
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
              <GoogleLocationPicker
                initialCoordinates={selectedCoordinates}
                onLocationConfirmed={handleLocationConfirmed}
              />
              <span className="text-xs text-black/45">or enter address manually</span>
            </div>
            {showLocationWarning ? (
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                The map-selected address has been filled in. Please verify and edit
                any details before placing your order. Fields you already edited
                were kept.
              </div>
            ) : null}
            <AddressFields
              form={{ ...form, fullName: form.fullName || customerName }}
              errors={fieldErrors}
              onChange={updateField}
            />
            <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm">
              <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} />
              Save this address for future orders
            </label>
          </div>
        )}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <p className="text-xs text-black/50">
          Online payment is verified before your order is confirmed, with the
          secure webhook as an idempotent fallback. Manage addresses on your{" "}
          <a href="/profile#saved-addresses" className="underline">
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
