import { orderService } from "@/services/order-service";
import { mobileOrder } from "@/lib/mobile-order";
import { invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const order = await orderService.getById(id);
    if (!order || order.userId !== user.id) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ order: mobileOrder(order) });
  });
}
