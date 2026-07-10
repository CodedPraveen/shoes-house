import TrackingTimeline from "./tracking-timeline";

export default function CustomerTrackingCard({ order }) {
    return (
        <div className="space-y-6">

            <div className="rounded-xs border border-black/10 bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold">
                    Package Tracking
                </h2>

                <div className="grid gap-4 md:grid-cols-2">

                    <div>
                        <p className="text-xs text-black/45">
                            Tracking Number
                        </p>

                        <p className="font-medium">
                            {order.trackingNumber || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-black/45">
                            Status
                        </p>

                        <p className="font-medium">
                            {order.trackingStatus || "-"}
                        </p>
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

                    <div>
                        <p className="text-xs text-black/45">
                            Last Updated
                        </p>

                        <p>
                            {order.lastTrackingSync
                                ? new Date(order.lastTrackingSync).toLocaleString("en-IN")
                                : "-"}
                        </p>
                    </div>

                </div>
            </div>

            <TrackingTimeline order={order} />

        </div>
    );
}