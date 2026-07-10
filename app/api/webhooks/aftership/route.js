import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
    try {
        const body = await req.json();

        const tracking = body?.data?.tracking;

        if (!tracking) {
            return NextResponse.json({
                success: true,
            });
        }

        await prisma.order.updateMany({
            where: {
                trackingNumber: tracking.tracking_number,
            },
            data: {
                trackingStatus: tracking.tag,
                lastTrackingSync: new Date(),
                deliveredAt:
                    tracking.tag === "Delivered"
                        ? new Date()
                        : null,
            },
        });

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