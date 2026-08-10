import { NextResponse } from "next/server";
import { getAdminErrorStatus, requireAdmin } from "@/lib/admin-auth";
import { getOrdersForExport } from "@/services/new-admin-service";

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export async function GET(request) {
  try {
    await requireAdmin();
  } catch (error) {
    const status = getAdminErrorStatus(error);
    return NextResponse.json(
      {
        error:
          status === 401
            ? "Authentication required"
            : status === 403
              ? "Forbidden"
              : "Unable to authorize request",
      },
      { status },
    );
  }
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const orders = await getOrdersForExport(params);
  const header = ["Order Number", "Date", "Customer", "Mobile", "Total", "Payment Method", "Payment Status", "Order Status", "Tracking Number", "Tracking Status", "Delivered Date"];
  const rows = orders.map((order) => [order.orderNumber, order.createdAt, order.shipFullName, order.shipPhone, order.total, order.paymentMethod, order.paymentStatus, order.status, order.trackingNumber, order.trackingStatus, order.deliveredAt]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  return new NextResponse(`\uFEFF${csv}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="post-mart-orders-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
