"use client";

import { useActionState } from "react";

import { createCategoryAction, updateCategoryAction } from "@/actions/admin-category-actions";
import { buttonClass, inputClass } from "@/components/new-admin/ui";
import LoadingButton from "@/components/ui/loading-button";

const initialState = { ok: false, error: null, message: null };

function Feedback({ state }) {
  if (state?.error) {
    return <p className="text-xs text-rose-600 sm:col-span-2" role="alert">{state.error}</p>;
  }

  if (state?.message) {
    return <p className="text-xs text-emerald-700 sm:col-span-2" role="status">{state.message}</p>;
  }

  return null;
}

export function CreateCategoryForm({ collection }) {
  const [state, action, pending] = useActionState(createCategoryAction, initialState);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
      <input type="hidden" name="collection" value={collection} />
      <label>
        <span className="mb-1.5 block text-xs font-medium text-slate-500">
          Category name <span className="text-rose-600" aria-hidden="true">*</span>
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
      <LoadingButton loading={pending} className={`${buttonClass} self-end`}>Add category</LoadingButton>
      <Feedback state={state} />
    </form>
  );
}

export function EditCategoryForm({ category }) {
  const [state, action, pending] = useActionState(updateCategoryAction, initialState);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="collection" value={category.collection} />
      <label>
        <span className="mb-1.5 block text-xs font-medium text-slate-500">Name</span>
        <input required name="name" maxLength={80} defaultValue={category.name} className={inputClass} />
      </label>
      <LoadingButton loading={pending} className={buttonClass}>Save</LoadingButton>
      <Feedback state={state} />
    </form>
  );
}
