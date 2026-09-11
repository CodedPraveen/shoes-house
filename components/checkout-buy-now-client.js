"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/format-price";
import { calculateShipping } from "@/lib/shipping";
import {
  createBuyNowCheckoutSessionAction,
  verifyRazorpayPaymentAction,
} from "@/actions/checkout-actions";
import { getAddressesAction } from "@/actions/address-actions";
import LoadingButton from "@/components/ui/loading-button";
import GoogleLocationPicker from "@/components/google-location-picker";
import { useUser } from "@clerk/nextjs";
import { useAuthSafe } from "@/hooks/use-auth-safe";
import SafeImage from "./ui/safe-image";
import AddressFields from "@/components/address-fields";
import {
  firstAddressError,
  mergeGeocodedAddress,
  validateAddressInput,
} from "@/lib/address-validation";

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const fulfillmentStorageKey = "buy-now-fulfillment";

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
  email: "",
  phone: "",
  line1: "",
  landmark: "",
  line2: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

function addressToForm(address, email = "") {
  return {
    label: address.label || "Home",
    fullName: address.fullName,
    email,
    phone: address.phone,
    line1: address.line1,
    landmark: address.landmark || "",
    line2: address.line2 || "",
    city: address.city,
    state: address.state,
    country: address.country || "India",
    pincode: address.pincode,
  };
}

function readPendingFulfillment() {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem(fulfillmentStorageKey);
    if (!value) return null;

    const pending = JSON.parse(value);
    return pending?.form && typeof pending.form === "object" ? pending : null;
  } catch {
    window.sessionStorage.removeItem(fulfillmentStorageKey);
    return null;
  }
}

function savePendingFulfillment(value) {
  window.sessionStorage.setItem(fulfillmentStorageKey, JSON.stringify(value));
}

function clearPendingFulfillment() {
  window.sessionStorage.removeItem(fulfillmentStorageKey);
}

export default function CheckoutBuyNowClient({ lineItem }) {
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuthSafe();
  const customerName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const customerEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");
  const quantity = Number(searchParams.get("quantity") || 1);

  const subtotal = lineItem.price * quantity;
  const shippingCost = calculateShipping(subtotal);
  const total = subtotal + shippingCost;

  const [pendingFulfillment] = useState(readPendingFulfillment);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState(
    pendingFulfillment ? "new" : "saved",
  );
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState(
    pendingFulfillment?.form ? { ...emptyForm, ...pendingFulfillment.form } : emptyForm,
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(
    pendingFulfillment?.paymentMethod || "razorpay",
  );
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(
    Boolean(pendingFulfillment?.saveAddress),
  );
  const touchedFieldsRef = useRef(new Set());
  const pendingFulfillmentRef = useRef(pendingFulfillment);
  const [showMobileAddressFields, setShowMobileAddressFields] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getAddressesAction();
        setSavedAddresses(rows);
        if (rows.length > 0) {
          if (!pendingFulfillmentRef.current && touchedFieldsRef.current.size === 0) {
            const def = rows.find((a) => a.isDefault) ?? rows[0];
            setSelectedAddressId(def.id);
            setForm(addressToForm(def));
            setAddressMode("saved");
          } else {
            setAddressMode("new");
          }
        } else {
          setAddressMode("new");
        }
      } catch {
        setAddressMode("new");
      }
    })();
  }, []);

  if (!productId || !size || !lineItem) {
    return (
      <p className="text-sm text-black/60">
        Invalid buy-now link.{" "}
        <a href="/shoes/products" className="underline">
          Browse products
        </a>
      </p>
    );
  }

  async function handlePay(e) {
    e.preventDefault();
    setError("");

    const validation = validateAddressInput(
      {
        ...form,
        fullName: form.fullName || customerName,
        email: form.email || customerEmail,
      },
      { requireEmail: true },
    );
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError(firstAddressError(validation.errors));
      if (
        Object.keys(validation.errors).some(
          (field) => field !== "fullName" && field !== "phone",
        )
      ) {
        setShowMobileAddressFields(true);
      }
      return;
    }

    setFieldErrors({});

    if (hasClerk && !isLoaded) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    if (hasClerk && !isSignedIn) {
      savePendingFulfillment({
        form: validation.address,
        paymentMethod,
        saveAddress,
      });
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        )}`,
      );
      return;
    }

    setLoading(true);

    const addressPayload =
      addressMode === "saved" && selectedAddressId
        ? { addressId: selectedAddressId, email: validation.address.email }
        : validation.address;

    try {
      const result = await createBuyNowCheckoutSessionAction({
        ...addressPayload,
        productId,
        size,
        quantity,
        paymentMethod,
        saveShippingAddress: addressMode === "new" && saveAddress,
      });

      if (!result.ok) {
        setError(result.error || "Could not start checkout");
        setLoading(false);
        return;
      }

      clearPendingFulfillment();

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
        async handler(response) {
          setLoading(true);
          setError("");
          try {
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
          } catch (verificationError) {
            setError(verificationError?.message || "Could not verify the payment. Check My Orders before retrying.");
          }
          setLoading(false);
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
      setLoading(false);
    }
  }

  function selectSavedAddress(id) {
    const address = savedAddresses.find((item) => item.id === id);
    if (!address) return;

    setSelectedAddressId(id);
    setForm(addressToForm(address, form.email || customerEmail));
    touchedFieldsRef.current.clear();
    setFieldErrors({});
    setSelectedCoordinates(null);
    setShowLocationWarning(false);
  }

  function switchToNewAddress() {
    setAddressMode("new");
    setSelectedAddressId(null);
    setForm((previous) => ({
      ...emptyForm,
      fullName: previous.fullName || customerName,
      email: previous.email || customerEmail,
    }));
    touchedFieldsRef.current.clear();
    setFieldErrors({});
    setSelectedCoordinates(null);
    setShowLocationWarning(false);
  }

  function handleLocationConfirmed({ address, coordinates }) {
    setError("");
    touchedFieldsRef.current.add("location");
    setAddressMode("new");
    setSelectedAddressId(null);
    setSelectedCoordinates(coordinates);
    setForm((previous) =>
      mergeGeocodedAddress(previous, address, touchedFieldsRef.current),
    );
    setShowLocationWarning(true);
  }

  function updateField(key, value) {
    touchedFieldsRef.current.add(key);
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  }


  return (
    <form
      onSubmit={handlePay}
      noValidate
      className="mx-auto grid w-full max-w-350 gap-10 px-0 pb-20 sm:px-8 lg:grid-cols-2"
    >
      <div className="space-y-6 no54123-3xl border p-6">
        <h2 className="text-lg font-medium">Shipping Address</h2>
        <p className="text-xs text-black/45">Buy Now — cart is not modified</p>

        {savedAddresses.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-black/45">
              Address book
            </p>
            {savedAddresses.map((address) => (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${addressMode === "saved" && selectedAddressId === address.id
                  ? "border-black bg-white"
                  : "border-black/10 bg-white/60"
                  }`}
              >
                <input
                  type="radio"
                  name="savedAddress"
                  className="mt-1"
                  checked={
                    addressMode === "saved" && selectedAddressId === address.id
                  }
                  onChange={() => {
                    setAddressMode("saved");
                    selectSavedAddress(address.id);
                  }}
                />
                <span className="text-sm text-black/80">
                  <span className="font-medium text-black">
                    {address.label || "Home"} · {address.fullName}
                    {address.isDefault ? (
                      <span className="ml-2 text-xs text-black/45">Default</span>
                    ) : null}
                  </span>
                  <br />
                  {address.line1}
                  {address.landmark ? `, ${address.landmark}` : ""}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  {address.phone}
                </span>
              </label>
            ))}
            <button
              type="button"
              onClick={switchToNewAddress}
              className="text-xs text-black/60 underline"
            >
              Use a different address
            </button>
          </div>
        ) : null}

        {addressMode === "saved" && selectedAddressId ? (
          <label>
            <span className="mb-1.5 block text-xs font-medium text-black/70">
              Email <span className="text-red-600" aria-hidden="true">*</span>
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email || customerEmail}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "buy-now-email-error" : undefined}
              className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${fieldErrors.email ? "border-red-500" : "border-black/10"}`}
            />
            {fieldErrors.email ? (
              <p id="buy-now-email-error" className="mt-1 text-xs text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </label>
        ) : null}

        {(addressMode === "new" || savedAddresses.length === 0) && (
          <div className="flex flex-wrap items-center gap-2">
            <GoogleLocationPicker
              initialCoordinates={selectedCoordinates}
              onLocationConfirmed={handleLocationConfirmed}
            />
            <span className="hidden sm:inline text-xs text-black/45">
              or enter address manually
            </span>
          </div>
        )}
        {showLocationWarning && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            The map-selected address has been filled in. Please verify and edit
            any details before placing your order. Fields you already edited were
            kept.
          </div>
        )}
        {(addressMode === "new" || savedAddresses.length === 0) && (
          <div className="space-y-3">
            {/* Mobile: Name + Phone only */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <label>
                <span className="mb-1.5 block text-xs font-medium text-black/70">
                  Name <span className="text-red-600" aria-hidden="true">*</span>
                </span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.fullName || customerName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                  aria-describedby={fieldErrors.fullName ? "buy-now-name-error" : undefined}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${fieldErrors.fullName ? "border-red-500" : "border-black/10"}`}
                />
                {fieldErrors.fullName ? (
                  <p id="buy-now-name-error" className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.fullName}
                  </p>
                ) : null}
              </label>

              <label className="col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-black/70">
                  Email <span className="text-red-600" aria-hidden="true">*</span>
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email || customerEmail}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "buy-now-email-error" : undefined}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${fieldErrors.email ? "border-red-500" : "border-black/10"}`}
                />
                {fieldErrors.email ? (
                  <p id="buy-now-email-error" className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-medium text-black/70">
                  Mobile number <span className="text-red-600" aria-hidden="true">*</span>
                </span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) =>
                    updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="Enter your mobile number"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  aria-describedby={fieldErrors.phone ? "buy-now-phone-error" : undefined}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${fieldErrors.phone ? "border-red-500" : "border-black/10"}`}
                />
                {fieldErrors.phone ? (
                  <p id="buy-now-phone-error" className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </label>
            </div>

            {/* Mobile: hidden address fields dropdown */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() =>
                  setShowMobileAddressFields((previous) => !previous)
                }
                className="flex w-full items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
              >
                <span>
                  {showMobileAddressFields
                    ? "Hide address details"
                    : "Enter address manually"}
                </span>

                <span className="text-lg leading-none">
                  {showMobileAddressFields ? "⌃" : "⌄"}
                </span>
              </button>

              {showMobileAddressFields && (
                <div className="mt-3">
                  <AddressFields
                    form={{ ...form, fullName: form.fullName || customerName }}
                    errors={fieldErrors}
                    onChange={updateField}
                    showContactFields={false}
                  />
                </div>
              )}
            </div>

            {/* Desktop: existing complete address form */}
            <div className="hidden sm:block">
              <AddressFields
                form={{ ...form, fullName: form.fullName || customerName, email: form.email || customerEmail }}
                errors={fieldErrors}
                onChange={updateField}
                showEmailField
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
              />
              Save this address for future orders
            </label>
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
