export default function TrackingTimeline({ order }) {
    const steps = [
        {
            key: "PENDING",
            label: "Order Created",
        },
        {
            key: "SHIPPED",
            label: "Shipped",
        },
        {
            key: "IN_TRANSIT",
            label: "In Transit",
        },
        {
            key: "OUT_FOR_DELIVERY",
            label: "Out For Delivery",
        },
        {
            key: "DELIVERED",
            label: "Delivered",
        },
    ];

    const current = steps.findIndex(
        (step) => step.key === order.trackingStatus,
    );

    return (
        <div className="rounded-xs border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold">
                Shipment Timeline
            </h2>

            <div className="space-y-6">
                {order.checkpoints?.map((cp) => (
                    <div
                        key={cp.id}
                        className="border-l-2 border-green-500 pl-4 pb-6"
                    >
                        <p className="font-medium">
                            {cp.message}
                        </p>

                        <p className="text-sm text-black/50">
                            {cp.location}
                        </p>

                        <p className="text-xs text-black/40">
                            {cp.checkpointTime
                                ? new Date(cp.checkpointTime).toLocaleString("en-IN")
                                : "-"}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}