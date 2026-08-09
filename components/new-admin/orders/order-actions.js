"use client";

import { useActionState } from "react";
import { addIndiaPostTrackingAction, cancelOrderAction, confirmOrderByCallAction, refreshIndiaPostTrackingAction } from "@/actions/new-admin-order-actions";
import { buttonClass, inputClass } from "@/components/new-admin/ui";

const initialState = { ok: false, error: null, message: null };

function Feedback({ state }) {
  if (state?.error) return <p className="text-xs text-rose-600">{state.error}</p>;
  if (state?.message) return <p className="text-xs text-emerald-700">{state.message}</p>;
  return null;
}

export default function OrderActions({ order, compact = false }) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmOrderByCallAction, initialState);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelOrderAction, initialState);
  const [trackingState, trackingAction, trackingPending] = useActionState(addIndiaPostTrackingAction, initialState);
  const [refreshState, refreshAction, refreshPending] = useActionState(refreshIndiaPostTrackingAction, initialState);
  const canConfirm = order.status === "PENDING" && !order.confirmedByCall;
  const canCancel = ["PENDING", "PROCESSING"].includes(order.status) && !order.trackingNumber;
  const canTrack = !order.trackingNumber && !["CANCELLED", "DELIVERED"].includes(order.status) && (!order.isCod || order.confirmedByCall);

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      {canConfirm ? (
        <div className="rounded-xl bg-amber-50 p-3">
          <a href={`tel:${order.shipPhone}`} className="text-sm font-semibold text-amber-950 underline decoration-amber-300 underline-offset-4">Call {order.shipPhone}</a>
          <form action={confirmAction} className="mt-2"><input type="hidden" name="orderId" value={order.id} /><button disabled={confirmPending} className={buttonClass}>{confirmPending ? "Confirming…" : "Confirm order"}</button></form>
          <Feedback state={confirmState} />
        </div>
      ) : null}

      {canTrack ? (
        <form action={trackingAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="block text-xs font-medium text-slate-500">India Post tracking number</label>
          <div className="flex flex-col gap-2 sm:flex-row"><input required name="trackingNumber" autoComplete="off" className={`${inputClass} uppercase`} placeholder="EE123456789IN" /><button disabled={trackingPending} className={buttonClass}>{trackingPending ? "Adding…" : "Add tracking"}</button></div>
          <Feedback state={trackingState} />
        </form>
      ) : null}

      {order.trackingNumber ? (
        <div className="flex flex-wrap items-center gap-2">
          <a href={order.trackingUrl || `https://www.aftership.com/track/india-post/${order.trackingNumber}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50">Track shipment</a>
          <form action={refreshAction}><input type="hidden" name="orderId" value={order.id} /><button disabled={refreshPending} className={buttonClass}>{refreshPending ? "Refreshing…" : "Refresh tracking"}</button></form>
          <Feedback state={refreshState} />
        </div>
      ) : null}

      {canCancel ? (
        <form action={cancelAction}><input type="hidden" name="orderId" value={order.id} /><button disabled={cancelPending} className="text-xs font-medium text-rose-600 hover:text-rose-800">{cancelPending ? "Cancelling…" : "Cancel order"}</button><Feedback state={cancelState} /></form>
      ) : null}
    </div>
  );
}
