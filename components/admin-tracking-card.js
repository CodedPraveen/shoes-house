"use client";

import { useActionState } from "react";
import { attachTrackingAction, refreshTrackingAction } from "@/actions/tracking-actions";

const initialState = {
    success: false,
    error: null,
};

export default function AdminTrackingCard({ order }) {
    const [state, formAction, pending] = useActionState(
        attachTrackingAction,
        initialState,
    );

    return (
        <div className="rounded-xs border border-black/10 bg-white p-6">

            <h2 className="mb-6 text-lg font-semibold">
                Shipment
            </h2>

            {order.trackingNumber ? (
                <div className="space-y-3">

                    <div>
                        <p className="text-xs text-black/45">
                            Tracking Number
                        </p>

                        <p className="font-medium">
                            {order.trackingNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-black/45">
                            Status
                        </p>

                        <p>{order.trackingStatus}</p>
                    </div>

                    <div>
                        <p className="text-xs text-black/45">
                            Shipped At
                        </p>

                        <p>
                            {order.shippedAt
                                ? new Date(order.shippedAt).toLocaleString("en-IN")
                                : "-"}
                        </p>
                    </div>
                    <form
                        action={async () => {
                            "use server";
                            await refreshTrackingAction(order.id);
                        }}
                    >
                        <button
                            type="submit"
                            className="mt-6 rounded-xs bg-black px-5 py-3 text-white hover:bg-zinc-800"
                        >
                            Refresh Status
                        </button>
                    </form>
                    <div>
                        <p className="text-xs text-black/45">
                            Last Sync
                        </p>

                        <p>
                            {order.lastTrackingSync
                                ? new Date(order.lastTrackingSync).toLocaleString("en-IN")
                                : "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-black/45">
                            Delivered At
                        </p>

                        <p>
                            {order.deliveredAt
                                ? new Date(order.deliveredAt).toLocaleString("en-IN")
                                : "-"}
                        </p>
                    </div>

                </div>
            ) : (
                <form action={formAction} className="space-y-4">

                    <input
                        type="hidden"
                        name="orderId"
                        value={order.id}
                    />

                    <input
                        name="trackingNumber"
                        placeholder="India Post Tracking Number"
                        className="w-full rounded-xs border border-black/10 p-3 outline-none"
                    />

                    <button
                        disabled={pending}
                        className="rounded-xs bg-black px-5 py-3 text-white"
                    >
                        {pending ? "Attaching..." : "Attach Tracking"}
                    </button>

                </form>
            )}

            {state.error && (
                <p className="mt-4 text-sm text-red-600">
                    {state.error}
                </p>
            )}

        </div>
    );
}