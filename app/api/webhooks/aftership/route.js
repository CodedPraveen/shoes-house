import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeTrackingStatus } from "@/lib/tracking-status";
import { transitionOrderStatus } from "@/services/order-workflow-service";

function verifySignature(rawBody, signature) {
    const expected = crypto
        .createHmac("sha256", process.env.AFTERSHIP_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("base64");

    return expected === signature;
}

export async function POST(req) {
    try {
        const rawBody = await req.text();

        const signature = req.headers.get(
            "as-signature-hmac-sha256",
        );

        if (
            !verifySignature(rawBody, signature)
        ) {
            return NextResponse.json(
                {
                    error: "Invalid signature",
                },
                {
                    status: 401,
                },
            );
        }

        const body = JSON.parse(rawBody);

        const tracking = body?.data?.tracking;

        if (!tracking) {
            return NextResponse.json({
                success: true,
            });
        }

        const status = normalizeTrackingStatus(
            tracking.tag,
        );

        const matchingOrders = await prisma.order.findMany({
            where: {
                trackingNumber:
                    tracking.tracking_number,
                deletedAt: null,
            },
            select: { id: true, status: true },
        });

        await prisma.order.updateMany({
            where: { id: { in: matchingOrders.map((order) => order.id) } },
            data: {
                trackingStatus: status,
                lastTrackingSync: new Date(),
                ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
            },
        });

        if (status === "DELIVERED") {
            for (const order of matchingOrders) {
                if (order.status !== "SHIPPED") continue;
                await transitionOrderStatus({
                    orderId: order.id,
                    expectedStatus: "SHIPPED",
                    newStatus: "DELIVERED",
                    actor: { identifier: "aftership-webhook", type: "SYSTEM" },
                    note: "Delivery confirmed by AfterShip webhook",
                });
            }
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
            },
            {
                status: 500,
            },
        );
    }
}
