import { z } from "zod";
import { cartService } from "@/services/cart-service";
import { invalidMobileRequest, parseMobileJson, withMobileUser } from "@/lib/mobile-api";

const quantitySchema = z.strictObject({ quantity: z.number().int().min(0).max(20) });

export async function PATCH(request, { params }) {
  const { lineId } = await params;
  const body = await parseMobileJson(request, quantitySchema);
  if (!body || !/^[A-Za-z0-9_-]{1,100}$/.test(lineId)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      return Response.json(await cartService.updateQuantity(user.id, lineId, body.quantity));
    } catch {
      return Response.json({ error: "Item unavailable or quantity exceeds stock" }, { status: 409 });
    }
  }, { mutation: true });
}

export async function DELETE(request, { params }) {
  const { lineId } = await params;
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(lineId)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => Response.json(await cartService.removeItem(user.id, lineId)), { mutation: true });
}
