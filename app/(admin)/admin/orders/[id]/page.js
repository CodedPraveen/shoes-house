import { notFound } from "next/navigation";
import { orderService } from "@/services/order-service";
import { formatPrice } from "@/lib/format-price";
import AdminTrackingCard from "@/components/admin-tracking-card";

export default async function AdminOrderDetailsPage({ params }) {
    const order = await orderService.getById(params.id);

    if (!order) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-6">

            <div className="rounded-xs border border-black/10 bg-white p-6">
                <h1 className="text-2xl font-bold">
                    {order.orderNumber}
                </h1>

                <p className="mt-2 text-sm text-black/60">
                    Created {new Date(order.createdAt).toLocaleString("en-IN")}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">

                <div className="rounded-xs border border-black/10 bg-white p-6">
                    <h2 className="mb-4 font-semibold">
                        Customer
                    </h2>

                    <p>{order.user.name}</p>
                    <p>{order.user.email}</p>
                    <p>{order.shipPhone}</p>
                </div>

                <div className="rounded-xs border border-black/10 bg-white p-6">
                    <h2 className="mb-4 font-semibold">
                        Shipping Address
                    </h2>

                    <p>{order.shipFullName}</p>
                    <p>{order.shipLine1}</p>

                    {order.shipLine2 && (
                        <p>{order.shipLine2}</p>
                    )}

                    <p>
                        {order.shipCity},{" "}
                        {order.shipState}
                    </p>

                    <p>{order.shipPincode}</p>
                </div>

            </div>

            <div className="rounded-xs border border-black/10 bg-white p-6">

                <h2 className="mb-4 font-semibold">
                    Ordered Items
                </h2>

                <div className="space-y-4">

                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between border-b border-black/10 pb-3"
                        >
                            <div>

                                <p className="font-medium">
                                    {item.productName}
                                </p>

                                <p className="text-sm text-black/60">
                                    {item.color} • {item.size}
                                </p>

                            </div>

                            <div>

                                Qty {item.quantity}

                            </div>

                            <div>

                                {formatPrice(item.total)}

                            </div>

                        </div>
                    ))}

                </div>

            </div>

            {/* <div
                id="tracking-section"
                className="rounded-xs border border-black/10 bg-white p-6"
            > 
            </div>
            */}
            <AdminTrackingCard order={order} />


        </div>
    );
}