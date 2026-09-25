import { z } from "zod";
import { wishlistService } from "@/services/wishlist-service";
import { productService } from "@/services/product-service";
import { mapProduct } from "@/lib/mappers/product-mapper";
import { invalidMobileRequest, parseMobileJson, withMobileUser } from "@/lib/mobile-api";

const itemSchema = z.strictObject({ productId: z.string().min(1).max(100) });

export async function GET(request) {
  return withMobileUser(request, async (user) => {
    const rows = await wishlistService.getByUserId(user.id);
    return Response.json({ items: rows.map((row) => mapProduct(row.product)) });
  });
}

export async function POST(request) {
  const body = await parseMobileJson(request, itemSchema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const product = await productService.getById(body.productId);
    if (!product) return Response.json({ error: "Product unavailable" }, { status: 404 });
    await wishlistService.add(user.id, body.productId);
    return Response.json({ added: true }, { status: 201 });
  }, { mutation: true });
}
