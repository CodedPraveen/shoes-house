import {
    CheckCircle2,
    Circle,
} from "lucide-react";

export default function TrackingTimeline({ order }) {

    const steps = [
        {
            key: "PENDING",
            label: "Order Confirmed",
        },
        {
            key: "SHIPPED",
            label: "Packed",
        },
        {
            key: "IN_TRANSIT",
            label: "Shipped",
        },
        {
            key: "OUT_FOR_DELIVERY",
            label: "Out for Delivery",
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
        <div className="rounded-xs bg-zinc-50 p-6">

            <h2 className="mb-6 text-lg font-semibold">
                Shipment Timeline
            </h2>

            <div className="space-y-0">

                {steps.map((step, index) => {

                    const completed = index <= current;

                    return (
                        <div
                            key={step.key}
                            className="flex items-start gap-4"
                        >

                            <div className="flex flex-col items-center">

                                {completed ? (
                                    <CheckCircle2
                                        size={20}
                                        className="text-green-600"
                                    />
                                ) : (
                                    <Circle
                                        size={20}
                                        className="text-black/30"
                                    />
                                )}

                                {index !== steps.length - 1 && (
                                    <div className="mt-1 h-8 w-px bg-black/10" />
                                )}

                            </div>

                            <div>

                                <p
                                    className={
                                        completed
                                            ? "font-medium"
                                            : "text-black/45"
                                    }
                                >
                                    {step.label}
                                </p>

                            </div>

                        </div>
                    );

                })}

            </div>

        </div>
    );
}