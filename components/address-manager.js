"use client";

import { useEffect, useState } from "react";
import {
  getAddressesAction,
  saveAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/address-actions";

const empty = {
  fullName: "",
  phone: "",
  line1: "",
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

  async function load() {
    const rows = await getAddressesAction();
    setAddresses(rows);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    await saveAddressAction({ ...form, id: editingId || undefined });
    setForm(empty);
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    await deleteAddressAction(id);
    load();
  }

  async function handleSetDefault(id) {
    await setDefaultAddressAction(id);
    load();
  }

  function startEdit(addr) {
    setEditingId(addr.id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || "",
      city: addr.city,
      state: addr.state,
      country: addr.country,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
  }

  const inputClass =
    "h-10 no54123-xl border border-black/15 bg-white px-3 text-sm w-full";

  return (
    <section className="space-y-4 no54123-3xl border border-black/10 p-6">
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
                {a.fullName}
                {a.isDefault ? (
                  <span className="ml-2 no54123-full bg-black px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                    Default
                  </span>
                ) : null}
              </p>
              <p>
                {a.line1}
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
      <form onSubmit={handleSave} className="grid gap-2 sm:grid-cols-2">
        <input
          required
          placeholder="Full name"
          className={inputClass}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
        <input
          required
          placeholder="Phone"
          className={inputClass}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          required
          placeholder="Address line 1"
          className={`${inputClass} sm:col-span-2`}
          value={form.line1}
          onChange={(e) => setForm({ ...form, line1: e.target.value })}
        />
        <input
          placeholder="Address line 2"
          className={`${inputClass} sm:col-span-2`}
          value={form.line2}
          onChange={(e) => setForm({ ...form, line2: e.target.value })}
        />
        <input
          required
          placeholder="City"
          className={inputClass}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          required
          placeholder="State"
          className={inputClass}
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />
        <input
          required
          placeholder="PIN"
          className={inputClass}
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />
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
          className="sm:col-span-2 no54123-full bg-black py-2.5 text-sm text-white"
        >
          {editingId ? "Update address" : "Add address"}
        </button>
      </form>
    </section>
  );
}
