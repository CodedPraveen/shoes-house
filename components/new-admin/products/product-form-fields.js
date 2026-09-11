"use client";

import { inputClass } from "@/components/new-admin/ui";

export default function ProductFormFields({
    form,
    update,
    collections,
    categories,
    mode,
    setSlugManuallyEdited,
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Product name{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <input
                    required
                    className={inputClass}
                    value={form.name}
                    placeholder="Product name"
                    onChange={(event) =>
                        update("name", event.target.value)
                    }
                />
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Slug{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <input
                    required
                    className={inputClass}
                    value={form.slug}
                    placeholder="product-slug"
                    onChange={(event) => {
                        setSlugManuallyEdited(true);
                        update("slug", event.target.value);
                    }}
                />
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Brand{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <input
                    required
                    className={inputClass}
                    value={form.brand}
                    placeholder="Brand name"
                    onChange={(event) =>
                        update("brand", event.target.value)
                    }
                />
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Collection
                </span>

                <select
                    className={inputClass}
                    value={form.collection}
                    onChange={(event) =>
                        update("collection", event.target.value)
                    }
                >
                    {collections.map((item) => (
                        <option
                            key={item.id}
                            value={item.collection}
                        >
                            {item.name}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Category{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <select
                    required
                    className={inputClass}
                    value={form.categorySlug}
                    onChange={(event) => {
                        const value = event.target.value;

                        update("categorySlug", value);

                        if (mode !== "edit") {
                            window.localStorage.setItem(
                                "admin-product-category",
                                value,
                            );
                        }
                    }}
                >
                    {categories.map((item) => (
                        <option
                            key={item.id}
                            value={item.slug}
                        >
                            {item.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Description{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <textarea
                    required
                    rows={6}
                    className={`${inputClass} h-auto py-3`}
                    value={form.description}
                    onChange={(event) =>
                        update(
                            "description",
                            event.target.value,
                        )
                    }
                />
            </label>
        </div>
    );
}