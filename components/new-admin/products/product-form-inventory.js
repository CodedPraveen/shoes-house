"use client";

import { inputClass } from "@/components/new-admin/ui";

export default function ProductFormInventory({
    form,
    update,
}) {
    return (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Price (₹){" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <input
                    required
                    type="number"
                    min="1"
                    className={inputClass}
                    value={form.price}
                    onChange={(event) =>
                        update("price", event.target.value)
                    }
                />
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Stock
                </span>

                <input
                    type="number"
                    min="0"
                    step="1"
                    className={inputClass}
                    value={form.stock}
                    onChange={(event) =>
                        update("stock", event.target.value)
                    }
                />

                <p className="mt-1 text-xs text-slate-500">
                    Total stock available for this product.
                </p>
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Sizes
                </span>

                <input
                    className={inputClass}
                    value={form.sizes}
                    placeholder="7, 8, 9, 10, 11"
                    onChange={(event) =>
                        update("sizes", event.target.value)
                    }
                />

                <p className="mt-1 text-xs text-slate-500">
                    Enter sizes separated by commas.
                </p>
            </label>
        </section>
    );
}