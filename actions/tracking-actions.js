"use server";

import { revalidatePath } from "next/cache";
import { attachTrackingToOrder } from "@/services/order-service";

export async function attachTrackingAction(formData) {
    const orderId = formData.get("orderId");
    const trackingNumber = formData.get("trackingNumber")?.trim();

    if (!trackingNumber) {
        return {
            success: false,
            message: "Tracking number is required.",
        };
    }

    try {
        await attachTrackingToOrder({
            orderId,
            trackingNumber,
        });

        revalidatePath("/admin/orders");

        return {
            success: true,
            message: "Tracking attached successfully.",
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
}