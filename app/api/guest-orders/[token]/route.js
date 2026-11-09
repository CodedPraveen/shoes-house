import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guestOrderAccessService } from "@/services/guest/guest-order-access-service";
import { assertRateLimit } from "@/lib/rate-limit";
import { guestOrderErrorResponse, guestOrderResponse } from "@/lib/guest-order-response";

export async function GET(request, { params }) {
    const { token } = await params;
    try {
        await assertRateLimit({ prefix: "guest-order-access", limit: 20, windowMs: 60_000 });
        const orderId = new URL(request.url).searchParams.get("orderId");
        if (!orderId || !/^[A-Za-z0-9_-]{10,64}$/.test(orderId)) {
            return NextResponse.json(
                { error: "Order link is invalid or expired" },
                { status: 404, headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" } },
            );
        }
        const access = await guestOrderAccessService.getOrderAccess(prisma, token, orderId);
        const response = guestOrderResponse(access);
        return NextResponse.json(response.body, {
            status: response.status,
            headers: response.headers,
        });
    } catch (error) {
        const response = guestOrderErrorResponse(error);
        return NextResponse.json(response.body, {
            status: response.status,
            headers: response.headers,
        });
    }
}
