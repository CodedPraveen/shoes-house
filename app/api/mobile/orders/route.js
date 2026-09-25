import { orderService } from "@/services/order-service";
import { mobileOrder } from "@/lib/mobile-order";
import { withMobileUser } from "@/lib/mobile-api";

export async function GET(request) {
  return withMobileUser(request, async (user) => {
    const query = new URL(request.url).searchParams;
    const page = Number(query.get("page") ?? 1);
    const pageSize = Number(query.get("pageSize") ?? 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
      return Response.json({ error: "Invalid pagination" }, { status: 400 });
    }
    const orders = await orderService.getOrdersByUserId(user.id);
    const start = (page - 1) * pageSize;
    return Response.json({
      items: orders.slice(start, start + pageSize).map(mobileOrder),
      page,
      total: orders.length,
      hasMore: start + pageSize < orders.length,
    });
  });
}
