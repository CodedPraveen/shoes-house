"use client";

import LoadingButton from "@/components/ui/loading-button";
import { buttonClass } from "@/components/new-admin/ui";

export default function ProductFormActions({
    mode,
    saving,
    deleting,
    onDelete,
    onDiscard,
}) {
    return (
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
                    onClick={onDiscard}
                    disabled={saving || deleting}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    Discard
                </LoadingButton>
            ) : null}

            {mode === "edit" ? (
                <LoadingButton
                    type="button"
                    onClick={onDelete}
                    loading={deleting}
                    disabled={saving}
                    className="h-10 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                    Delete product
                </LoadingButton>
            ) : null}
        </div>
    );
}
