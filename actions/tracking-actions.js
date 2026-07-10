"use server";

import { revalidatePath } from "next/cache";
import { attachTrackingToOrder } from "@/services/order-service";
import { refreshTrackingStatus } from "@/services/order-service";

export async function attachTrackingAction(formData) {
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
        return {
            success: false,
            error: error.message,
        };
    }
}
export async function refreshTrackingAction(orderId) {
    try {
        await refreshTrackingStatus(orderId);

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${orderId}`);

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