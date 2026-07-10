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
            <h2 className="mb-6 text-lg font-semibold">
                Shipment Timeline
            </h2>

            <div className="space-y-6">
                {steps.map((step, index) => {
                    const active = index <= current;

                    return (
                        <div
                            key={step.key}
                            className="flex items-center gap-4"
                        >
                            <div
                                className={`h-4 w-4 rounded-full ${active
                                        ? "bg-green-600"
                                        : "bg-zinc-300"
                                    }`}
                            />

                            <span
                                className={
                                    active
                                        ? "font-medium"
                                        : "text-black/45"
                                }
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}