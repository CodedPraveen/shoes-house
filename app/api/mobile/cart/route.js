import { z } from "zod";
import { cartService } from "@/services/cart-service";
import { invalidMobileRequest, parseMobileJson, withMobileUser } from "@/lib/mobile-api";

const addSchema = z.strictObject({
  productId: z.string().min(1).max(100),
  size: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20),
});

export async function GET(request) {
  return withMobileUser(request, async (user) => Response.json(await cartService.getCartSummary(user.id)));
}

export async function POST(request) {
  const body = await parseMobileJson(request, addSchema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      return Response.json(await cartService.addItem(user.id, body));
    } catch {
      return Response.json({ error: "Item unavailable or quantity exceeds stock" }, { status: 409 });
    }
  }, { mutation: true });
}
