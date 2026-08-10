"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProductAction,
  deleteProductAction,
  discardProductImageUploadsAction,
  getSubCategoriesAction,
  updateProductAction,
  uploadNewAdminProductImageAction,
} from "@/actions/admin-product-actions";
import { buttonClass, inputClass } from "@/components/new-admin/ui";
import { COLOR_FILTERS } from "@/lib/constants";
import { slugify } from "@/lib/slugify-text";

const defaultColors = COLOR_FILTERS.slice(0, 3).map((color) => ({ colorKey: color.id, label: color.label, hex: color.hex }));

export default function NewAdminProductForm({ mode = "create", productId, initial, collections, subCategories }) {
  function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setImageFiles((current) => [...current, ...files]);

    event.target.value = "";
  }
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState(initial?.images ?? []);
  const [categories, setCategories] = useState(subCategories ?? []);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    brand: initial?.brand ?? "Post Mart",
    price: initial?.price ?? "",
    stockPerVariant: initial?.variantRecords?.[0]?.stock ?? 0,
    sizes: initial?.sizes?.join(", ") ?? "38, 40, 42, 44",
    collection: initial?.collection ?? collections?.[0]?.collection ?? "SHOES",
    categorySlug: initial?.category ?? subCategories?.[0]?.slug ?? "",
    isNew: initial?.isNew ?? false,
    isTrending: initial?.isTrending ?? false,
    colors: initial?.colorRecords?.length ? initial.colorRecords.map((color) => ({ colorKey: color.colorKey, label: color.label, hex: color.hex })) : defaultColors,
  });

  useEffect(() => {
    let active = true;
    getSubCategoriesAction(form.collection).then((items) => {
      if (!active) return;
      setCategories(items);
      setForm((current) => ({ ...current, categorySlug: items.some((item) => item.slug === current.categorySlug) ? current.categorySlug : items[0]?.slug ?? "" }));
    }).catch(() => setError("Unable to load subcategories."));
    return () => { active = false; };
  }, [form.collection]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value, ...(key === "name" && mode === "create" && !current.slug ? { slug: slugify(value) } : {}) }));

  async function submit(event) {
    event.preventDefault();
    if (!existingImageUrls.length && !imageFiles.length) {
      setError("Select at least one product image.");
      return;
    }
    setSaving(true);
    setError("");
    const uploadedImages = [];
    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const upload = await uploadNewAdminProductImageAction(formData);
        if (!upload?.ok) {
          throw new Error(upload?.error || `Unable to upload ${file.name}.`);
        }
        uploadedImages.push({ url: upload.url, publicId: upload.publicId });
      }

      const payload = {
        ...form,
        price: Number(form.price),
        stockPerVariant: Number(form.stockPerVariant) || 0,
        imageUrls: [
          ...existingImageUrls,
          ...uploadedImages.map((image) => image.url),
        ],
        sizes: form.sizes
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isFinite(value) && value > 0),
      };
      const result = mode === "edit" ? await updateProductAction(productId, payload) : await createProductAction(payload);
      if (!result?.ok) throw new Error("Save failed.");
      router.push("/new-admin/products");
      router.refresh();
    } catch (saveError) {
      if (uploadedImages.length) {
        await discardProductImageUploadsAction(
          uploadedImages.map((image) => image.publicId),
        ).catch(() => null);
      }
      setError(saveError.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!productId || !window.confirm("Soft-delete this product?")) return;
    setSaving(true);
    try {
      await deleteProductAction(productId);
      router.push("/new-admin/products");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete product.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-slate-500">Product name</span><input required className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Slug</span><input required className={inputClass} value={form.slug} onChange={(event) => update("slug", event.target.value)} /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Brand</span><input required className={inputClass} value={form.brand} onChange={(event) => update("brand", event.target.value)} /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Collection</span><select className={inputClass} value={form.collection} onChange={(event) => update("collection", event.target.value)}>{collections.map((item) => <option key={item.id} value={item.collection}>{item.name}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Category</span><select required className={inputClass} value={form.categorySlug} onChange={(event) => update("categorySlug", event.target.value)}>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-medium text-slate-500">Description</span><textarea required rows={6} className={`${inputClass} h-auto py-3`} value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
        </div>
      </div>
      <div className="space-y-5">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Price (₹)</span><input required type="number" min="1" className={inputClass} value={form.price} onChange={(event) => update("price", event.target.value)} /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Stock per variant</span><input type="number" min="0" className={inputClass} value={form.stockPerVariant} onChange={(event) => update("stockPerVariant", event.target.value)} /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-slate-500">Sizes</span><input className={inputClass} value={form.sizes} onChange={(event) => update("sizes", event.target.value)} /></label>
          <label className="block text-sm font-medium text-slate-700">
            Product images
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-slate-600
    file:mr-4 file:rounded-lg file:border-0
    file:bg-slate-900 file:px-4 file:py-2
    file:text-sm file:font-medium file:text-white
    hover:file:bg-slate-800"
          />

          <p className="mt-1 text-xs text-slate-500">
            Upload product images from your device. JPG, PNG or WEBP.
          </p>

          {existingImageUrls.length > 0 || imageFiles.length > 0 ? (
            <div className="mt-3 space-y-2">
              {existingImageUrls.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span className="truncate">Existing image {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setExistingImageUrls((current) =>
                        current.filter((_, imageIndex) => imageIndex !== index)
                      );
                    }}
                    className="ml-3 text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {imageFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span className="truncate">
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setImageFiles((current) =>
                        current.filter((_, fileIndex) => fileIndex !== index)
                      );
                    }}
                    className="ml-3 text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(event) => update("isNew", event.target.checked)} />New arrival</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isTrending} onChange={(event) => update("isTrending", event.target.checked)} />Trending</label></div>
        </section>
        {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
        <div className="flex flex-wrap gap-3"><button disabled={saving} className={buttonClass}>{saving ? "Saving…" : mode === "edit" ? "Save changes" : "Create product"}</button>{mode === "edit" ? <button type="button" onClick={remove} disabled={saving} className="h-10 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50">Delete product</button> : null}</div>
      </div>
    </form>
  );
}
