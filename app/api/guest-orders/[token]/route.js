import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { guestOrderAccessService } from "@/services/guest/guest-order-access-service";
import { assertRateLimit } from "@/lib/rate-limit";

export async function GET(request, { params }) {
    const { token } = await params;
    try {
        await assertRateLimit({ prefix: "guest-order-access", limit: 20, windowMs: 60_000 });
        const order = await guestOrderAccessService.findOrderByToken(prisma, token);
        if (!order) {
            return NextResponse.json({ error: "Order link is invalid or expired" }, {
                status: 404,
                headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" },
            });
        }
        const { userId, guestAccessTokenHash, guestAccessExpiresAt, guestAccessRevokedAt, ...safeOrder } = order;
        return NextResponse.json(safeOrder, {
            headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" },
        });
    } catch (error) {
        return NextResponse.json({ error: "Unable to retrieve order" }, {
            status: 429,
            headers: { "Cache-Control": "no-store, private", "Referrer-Policy": "no-referrer" },
        });
    }
}
