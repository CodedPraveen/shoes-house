"use client";

import { useActionState } from "react";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/actions/admin-category-actions";
import { buttonClass, inputClass } from "@/components/new-admin/ui";
import LoadingButton from "@/components/ui/loading-button";

const initialState = {
  ok: false,
  error: null,
  message: null,
};

function Feedback({ state }) {
  if (state?.error) {
    return (
      <p
        className="text-xs text-rose-600 sm:col-span-2"
        role="alert"
      >
        {state.error}
      </p>
    );
  }

  if (state?.message) {
    return (
      <p
        className="text-xs text-emerald-700 sm:col-span-2"
        role="status"
      >
        {state.message}
      </p>
    );
  }

  return null;
}

function ImageField({ currentImage, label = "Category image" }) {
  return (
    <label className="block sm:col-span-2">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </span>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        {currentImage ? (
          <div className="mb-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <img
              src={currentImage}
              alt=""
              className="h-32 w-full object-cover"
            />
          </div>
        ) : (
          <div className="mb-3 flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs text-slate-400">
            No category image
          </div>
        )}

        <input
          type="file"
          name="image"
          accept="image/jpeg,image/png"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white"
        />

        <p className="mt-2 text-xs text-slate-400">
          JPG or PNG, maximum 10 MB.
        </p>
      </div>
    </label>
  );
}

export function CreateCategoryForm({ collection }) {
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initialState,
  );

  return (
    <form
      action={action}
      // encType="multipart/form-data"
      className="grid gap-3 sm:grid-cols-2"
    >
      <input
        type="hidden"
        name="collection"
        value={collection}
      />

      <label>
        <span className="mb-1.5 block text-xs font-medium text-slate-500">
          Category name{" "}
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
        </span>

        <input
          required
          autoComplete="off"
          name="name"
          maxLength={80}
          className={inputClass}
          placeholder="Running Shoes"
        />
      </label>

      <ImageField />

      <LoadingButton
        loading={pending}
        className={`${buttonClass} self-end sm:col-span-2`}
      >
        Add category
      </LoadingButton>

      <Feedback state={state} />
    </form>
  );
}

export function EditCategoryForm({ category }) {
  const [state, action, pending] = useActionState(
    updateCategoryAction,
    initialState,
  );

  return (
    <form
      action={action}
      // encType="multipart/form-data"
      className="grid gap-3 sm:grid-cols-2"
    >
      <input
        type="hidden"
        name="id"
        value={category.id}
      />

      <input
        type="hidden"
        name="collection"
        value={category.collection}
      />

      <label>
        <span className="mb-1.5 block text-xs font-medium text-slate-500">
          Name
        </span>

        <input
          required
          name="name"
          maxLength={80}
          defaultValue={category.name}
          className={inputClass}
        />
      </label>

      <ImageField
        currentImage={category.imageUrl}
        label="Category image"
      />

      <LoadingButton
        loading={pending}
        className="sm:col-span-2"
      >
        Save
      </LoadingButton>

      <Feedback state={state} />
    </form>
  );
}