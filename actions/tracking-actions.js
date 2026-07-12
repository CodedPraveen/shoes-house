"use server";

import { revalidatePath } from "next/cache";
import { attachTrackingToOrder } from "@/services/order-service";
import { refreshTrackingStatus } from "@/services/order-service";

export async function attachTrackingAction(previousState, formData) {
    try {
        const orderId = formData.get("orderId");
        const trackingNumber = formData.get("trackingNumber")?.trim();

        if (!trackingNumber) {
            throw new Error("Tracking number is required.");
        }

        await attachTrackingToOrder({
            orderId,
            trackingNumber,
        });

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${orderId}`);

        return {
            success: true,
        };
    } catch (error) {
        console.error(error);

        return {
            success: false,
            error: error.message,
        };
    }
}
export async function refreshTrackingAction(previousState, formData) {
    const orderId1 = formData.get("orderId");

    try {
        await refreshTrackingStatus(orderId1);

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${orderId1}`);

        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}