"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createProductAction,
  deleteProductAction,
  getSubCategoriesAction,
  updateProductAction,
} from "@/actions/admin-product-actions";

import AdminImageUpload from "@/components/admin/admin-image-upload";
import LoadingButton from "@/components/ui/loading-button";
import { buttonClass, inputClass } from "@/components/new-admin/ui";
import { slugify } from "@/lib/slugify-text";

const MAX_PRODUCT_IMAGES = 8;

export default function NewAdminProductForm({
  mode = "create",
  productId,
  initial,
  collections,
  subCategories,
}) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState(subCategories ?? []);

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    brand: initial?.brand ?? "Post Mart",
    price: initial?.price ?? "",

    stock: initial?.stock ?? 3,

    sizes: initial?.sizes?.join(", ") ?? "7, 8, 9, 10, 11",

    collection:
      initial?.collection ??
      collections?.[0]?.collection ??
      "SHOES",

    categorySlug:
      initial?.category ??
      subCategories?.[0]?.slug ??
      "",

    isNew: initial?.isNew ?? true,
    isTrending: initial?.isTrending ?? false,

    images: (initial?.images ?? []).map((url) => ({
      type: "existing",
      url,
    })),
  });

  useEffect(() => {
    let active = true;

    async function loadSubCategories() {
      try {
        const items = await getSubCategoriesAction(form.collection);

        if (!active) return;

        setCategories(items);

        setForm((current) => ({
          ...current,
          categorySlug: items.some(
            (item) => item.slug === current.categorySlug,
          )
            ? current.categorySlug
            : items[0]?.slug ?? "",
        }));
      } catch (categoryError) {
        console.error(
          "[new-admin] category loading failed:",
          categoryError,
        );

        if (active) {
          setError("Unable to load subcategories.");
        }
      }
    }

    loadSubCategories();

    return () => {
      active = false;
    };
  }, [form.collection]);

  function update(key, value) {
    setForm((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (
        key === "name" &&
        mode === "create" &&
        !current.slug
      ) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  function handleImagesChange(images) {
    setError("");

    if (images.length > MAX_PRODUCT_IMAGES) {
      setError(
        `Maximum ${MAX_PRODUCT_IMAGES} product images are allowed.`,
      );
      return;
    }

    update("images", images);
  }

  async function submit(event) {
    event.preventDefault();

    setError("");

    if (!form.images.length) {
      setError("Add at least one product image.");
      return;
    }

    if (form.images.length > MAX_PRODUCT_IMAGES) {
      setError(
        `Maximum ${MAX_PRODUCT_IMAGES} product images are allowed.`,
      );
      return;
    }

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Product slug is required.");
      return;
    }

    if (!form.categorySlug) {
      setError("Please select a category.");
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be a valid number greater than 0.");
      return;
    }

    const stock = Number(form.stock);

    if (!Number.isFinite(stock) || stock < 0) {
      setError(
        "Stock must be a valid number greater than or equal to 0.",
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const productFields = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        brand: form.brand,
        price,
        stock: Math.floor(stock),
        collection: form.collection,
        categorySlug: form.categorySlug,
        isNew: form.isNew,
        isTrending: form.isTrending,

        sizes: form.sizes
          .split(",")
          .map((value) => Number(value.trim()))
          .filter(
            (value) =>
              Number.isFinite(value) && value > 0,
          ),
      };

      const formData = new FormData();

      formData.append(
        "product",
        JSON.stringify(productFields),
      );

      const imageOrder = [];

      let newFileIndex = 0;

      for (const image of form.images) {
        if (image.type === "existing") {
          imageOrder.push({
            type: "existing",
            url: image.url,
          });
          continue;
        }

        if (image.type === "new") {
          formData.append("files", image.file);

          imageOrder.push({
            type: "file",
            index: newFileIndex,
          });

          newFileIndex += 1;
        }
      }

      formData.append(
        "imageOrder",
        JSON.stringify(imageOrder),
      );

      const result =
        mode === "edit"
          ? await updateProductAction(
            productId,
            formData,
          )
          : await createProductAction(formData);

      if (!result?.ok) {
        throw new Error(
          result?.error || "Unable to save product.",
        );
      }

      router.push(
        mode === "edit"
          ? "/new-admin/products"
          : "/new-admin/products?created=processing",
      );

      router.refresh();
    } catch (saveError) {
      console.error(
        "[new-admin] product save failed:",
        saveError,
      );

      setError(
        saveError?.message ||
        "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (
      !productId ||
      !window.confirm("Soft-delete this product?")
    ) {
      return;
    }

    if (deleting) return;

    setDeleting(true);
    setError("");

    try {
      await deleteProductAction(productId);

      router.push("/new-admin/products");
      router.refresh();
    } catch (deleteError) {
      console.error(
        "[new-admin] product delete failed:",
        deleteError,
      );

      setError(
        deleteError?.message ||
        "Unable to delete product.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
                onChange={(event) =>
                  update("slug", event.target.value)
                }
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
        </div>

        <div className="space-y-5">
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

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Product images{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </span>

                <span className="text-xs text-slate-500">
                  {form.images.length} / {MAX_PRODUCT_IMAGES}
                </span>
              </div>

              <AdminImageUpload
                images={form.images}
                onChange={handleImagesChange}
              />

              <p className="mt-2 text-xs text-slate-500">
                Select up to {MAX_PRODUCT_IMAGES} images from
                your device. JPG and PNG files are converted to
                WebP without resizing after the product is
                created.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Images are uploaded to the server only when you
                create or save the product.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(event) =>
                    update("isNew", event.target.checked)
                  }
                />

                New arrival
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isTrending}
                  onChange={(event) =>
                    update(
                      "isTrending",
                      event.target.checked,
                    )
                  }
                />

                Trending
              </label>
            </div>
          </section>

          {error ? (
            <p
              className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <LoadingButton
              type="submit"
              loading={saving}
              disabled={deleting}
              className={buttonClass}
            >
              {mode === "edit"
                ? "Save changes"
                : "Create product"}
            </LoadingButton>

            {mode === "edit" ? (
              <LoadingButton
                type="button"
                onClick={remove}
                loading={deleting}
                disabled={saving}
                className="h-10 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50"
              >
                Delete product
              </LoadingButton>
            ) : null}
          </div>
        </div>
      </form>
    </>
  );
}