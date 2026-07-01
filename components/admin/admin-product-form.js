"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getCloudinaryConfigAction,
} from "@/actions/admin-product-actions";
import AdminCloudinaryUpload from "@/components/admin/admin-cloudinary-upload";
import LoadingButton from "@/components/ui/loading-button";
import { COLOR_FILTERS } from "@/lib/constants";
import { slugify } from "@/lib/slugify-text";

const inputClass =
  "h-11 w-full no54123-xl border border-black/15 bg-white px-4 text-sm outline-none ring-black/20 focus:ring-2";

const defaultColors = COLOR_FILTERS.slice(0, 3).map((c) => ({
  colorKey: c.id,
  label: c.label,
  hex: c.hex,
}));

export default function AdminProductForm({
  mode = "create",
  productId = null,
  initial = null,
  categories = [],
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cloudinaryConfig, setCloudinaryConfig] = useState(null);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    categorySlug: initial?.category ?? categories[0]?.slug ?? "shoes",
    brand: initial?.brand ?? "Shoes House",
    price: initial?.price ?? "",
    stockPerVariant: initial?.variantRecords?.[0]?.stock ?? 10,
    sizes: initial?.sizes?.join(",") ?? "38,40,42,44",
    isNew: initial?.isNew ?? false,
    isTrending: initial?.isTrending ?? false,
    imageUrls: initial?.images ?? [],
    colors: initial?.colorRecords?.length
      ? initial.colorRecords.map((c) => ({
          colorKey: c.colorKey,
          label: c.label,
          hex: c.hex,
        }))
      : defaultColors,
  });

  // useEffect(() => {
  //   getCloudinaryConfigAction().then(setCloudinaryConfig);
  // }, []);

  function update(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && mode === "create" && !prev.slug) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  function buildPayload() {
    const sizes = form.sizes
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n) && n > 0);

    return {
      name: form.name,
      slug: form.slug,
      description: form.description,
      categorySlug: form.categorySlug,
      brand: form.brand,
      price: Number(form.price),
      stockPerVariant: Number(form.stockPerVariant) || 0,
      sizes,
      colors: form.colors,
      imageUrls: form.imageUrls,
      isNew: form.isNew,
      isTrending: form.isTrending,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = buildPayload();
      const result =
        mode === "edit"
          ? await updateProductAction(productId, payload)
          : await createProductAction(payload);

      if (!result.ok) {
        setError("Save failed");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!productId || !confirm("Soft-delete this product?")) return;
    setLoading(true);
    try {
      await deleteProductAction(productId);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="lazyOnload"
      />
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-black/50">Name</span>
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/50">Slug</span>
            <input
              required
              className={inputClass}
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/50">Category</span>
            <select
              className={inputClass}
              value={form.categorySlug}
              onChange={(e) => update("categorySlug", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-black/50">Description</span>
            <textarea
              required
              rows={4}
              className={`${inputClass} h-auto py-3`}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/50">Price (₹)</span>
            <input
              required
              type="number"
              min={1}
              className={inputClass}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-xs text-black/50">Stock per variant</span>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.stockPerVariant}
              onChange={(e) => update("stockPerVariant", e.target.value)}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-black/50">Sizes (comma-separated)</span>
            <input
              className={inputClass}
              value={form.sizes}
              onChange={(e) => update("sizes", e.target.value)}
            />
          </label>
        </div>

        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isNew}
              onChange={(e) => update("isNew", e.target.checked)}
            />
            New arrival
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isTrending}
              onChange={(e) => update("isTrending", e.target.checked)}
            />
            Trending
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs text-black/50">Images (Cloudinary)</p>
          <AdminCloudinaryUpload
            imageUrls={form.imageUrls}
            onChange={(urls) => update("imageUrls", urls)}
            cloudinaryConfig={cloudinaryConfig}
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-wrap gap-3">
          <LoadingButton
            type="submit"
            loading={loading}
            className="no54123-full bg-black px-6 py-2.5 text-sm text-white"
          >
            {mode === "edit" ? "Save changes" : "Create product"}
          </LoadingButton>
          {mode === "edit" ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="no54123-full border border-red-200 px-6 py-2.5 text-sm text-red-600"
            >
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
