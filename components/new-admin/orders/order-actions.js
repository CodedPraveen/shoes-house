"use client";

import { useActionState } from "react";
import {
  addIndiaPostTrackingAction,
  cancelOrderAction,
  refreshIndiaPostTrackingAction,
  transitionOrderStatusAction,
} from "@/actions/new-admin-order-actions";
import { buttonClass, inputClass } from "@/components/new-admin/ui";
import { getOrderStatusConfig } from "@/lib/order-status";

const initialState = { ok: false, error: null, message: null };

function Feedback({ state }) {
  if (state?.error) return <p className="mt-2 text-xs text-rose-600">{state.error}</p>;
  if (state?.message) return <p className="mt-2 text-xs text-emerald-700">{state.message}</p>;
  return null;
}

export default function OrderActions({ order, compact = false }) {
  const [advanceState, advanceAction, advancePending] = useActionState(transitionOrderStatusAction, initialState);
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelOrderAction, initialState);
  const [trackingState, trackingAction, trackingPending] = useActionState(addIndiaPostTrackingAction, initialState);
  const [refreshState, refreshAction, refreshPending] = useActionState(refreshIndiaPostTrackingAction, initialState);
  const config = getOrderStatusConfig(order.status);
  const canAdvance = Boolean(config.next && order.status !== "READY_TO_SEND");
  const canCancel = ["PENDING", "CONFIRMED", "PROCESSING", "READY_TO_SEND"].includes(order.status) && !order.trackingNumber;
  const canTrack = order.status === "READY_TO_SEND" && !order.trackingNumber;

  return (
    <div className={compact ? "space-y-2" : "space-y-4"}>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Next action</p>
        <p className="mt-1 text-sm font-medium text-slate-900">{config.nextAction}</p>
        {order.status === "PENDING" ? (
          <a href={`tel:${order.shipPhone}`} className="mt-2 inline-block text-sm font-semibold text-indigo-700 underline underline-offset-4">
            Call {order.shipPhone}
          </a>
        ) : null}
      </div>

      {canAdvance ? (
        <form action={advanceAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="expectedStatus" value={order.status} />
          <input type="hidden" name="newStatus" value={config.next} />
          <button disabled={advancePending} className={buttonClass}>
            {advancePending ? "Updating…" : config.buttonLabel}
          </button>
          <Feedback state={advanceState} />
        </form>
      ) : null}

      {canTrack ? (
        <form action={trackingAction} className="space-y-2 rounded-xl border border-slate-200 p-3">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="block text-xs font-medium text-slate-500">India Post tracking number</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input required name="trackingNumber" autoComplete="off" className={`${inputClass} uppercase`} placeholder="EE123456789IN" />
            <button disabled={trackingPending} className={buttonClass}>{trackingPending ? "Adding…" : "Add tracking / Mark shipped"}</button>
          </div>
          <Feedback state={trackingState} />
        </form>
      ) : null}

      {order.trackingNumber ? (
        <div className="flex flex-wrap items-center gap-2">
          <a href={order.trackingUrl || `https://www.aftership.com/track/india-post/${order.trackingNumber}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50">Track shipment</a>
          <form action={refreshAction}>
            <input type="hidden" name="orderId" value={order.id} />
            <button disabled={refreshPending} className={buttonClass}>{refreshPending ? "Refreshing…" : "Refresh tracking"}</button>
          </form>
          <Feedback state={refreshState} />
        </div>
      ) : null}

      {canCancel ? (
        <form action={cancelAction}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="expectedStatus" value={order.status} />
          <button disabled={cancelPending} className="text-xs font-medium text-rose-600 hover:text-rose-800">{cancelPending ? "Cancelling…" : "Cancel order"}</button>
          <Feedback state={cancelState} />
        </form>
      ) : null}
    </div>
  );
}
