"use client";

import { useEffect, useState } from "react";
import {
  getAddressesAction,
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/address-actions";
import AddressFields from "@/components/address-fields";
import {
  firstAddressError,
  validateAddressInput,
} from "@/lib/address-validation";

const empty = {
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
  isDefault: false,
};

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const rows = await getAddressesAction();
      setAddresses(rows);
    } catch (loadError) {
      setError(loadError?.message || "Could not load saved addresses.");
    }
  }

  useEffect(() => {
    let active = true;

    getAddressesAction()
      .then((rows) => {
        if (active) setAddresses(rows);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || "Could not load saved addresses.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setError("");

    const validation = validateAddressInput(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError(firstAddressError(validation.errors));
      return;
    }

    setSaving(true);
    try {
      await saveAddressAction({ ...form, id: editingId || undefined });
      setForm(empty);
      setEditingId(null);
      setFieldErrors({});
      await load();
    } catch (saveError) {
      setError(saveError?.message || "Could not save this address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this saved address? Existing orders will keep their shipping address.")) {
      return;
    }

    setError("");
    try {
      await deleteAddressAction(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(empty);
      }
      await load();
    } catch (deleteError) {
      setError(deleteError?.message || "Could not remove this address.");
    }
  }

  async function handleSetDefault(id) {
    setError("");
    try {
      await setDefaultAddressAction(id);
      await load();
    } catch (defaultError) {
      setError(defaultError?.message || "Could not update the default address.");
    }
  }

  function startEdit(addr) {
    setEditingId(addr.id);
    setError("");
    setFieldErrors({});
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      landmark: addr.landmark || "",
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      country: addr.country,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
  }

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  return (
    <section id="saved-addresses" className="space-y-4 no54123-3xl border border-black/10 p-6">
      <h2 className="text-xl font-semibold">Address book</h2>
      <p className="text-sm text-black/60">
        Save addresses for faster checkout. Select one at checkout or enter a new
        address.
      </p>
      <ul className="space-y-3 text-sm text-black/70">
        {addresses.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-start justify-between gap-2 no54123-2xl border border-black/10 p-4"
          >
            <div>
              <p className="font-medium text-black">
                {a.label || "Home"} · {a.fullName}
                {a.isDefault ? (
                  <span className="ml-2 no54123-full bg-black px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Default
                  </span>
                ) : null}
              </p>
              <p>
                {a.line1}
                {a.landmark ? `, ${a.landmark}` : ""}
                {a.line2 ? `, ${a.line2}` : ""}
              </p>
              <p>
                {a.city}, {a.state} {a.pincode}
              </p>
              <p>{a.phone}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {!a.isDefault ? (
                <button
                  type="button"
                  onClick={() => handleSetDefault(a.id)}
                  className="text-xs underline"
                >
                  Set default
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => startEdit(a)}
                className="text-xs underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(a.id)}
                className="text-xs text-red-600"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSave} className="space-y-3">
        <AddressFields form={form} errors={fieldErrors} onChange={updateField} />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) =>
              setForm({ ...form, isDefault: e.target.checked })
            }
          />
          Set as default address
        </label>
        <button
          type="submit"
          disabled={saving}
          className="w-full no54123-full bg-black py-2.5 text-sm text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : editingId ? "Update address" : "Add address"}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(empty);
              setFieldErrors({});
              setError("");
            }}
            className="w-full text-xs text-black/60 underline"
          >
            Cancel editing
          </button>
        ) : null}
        {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
      </form>
    </section>
  );
}
