import { productService } from "@/services/product-service";
import { withAbsoluteProductImages } from "@/lib/mobile-product-images";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    return Response.json({ error: "Invalid product" }, { status: 400 });
  }
  try {
    const product = await productService.getById(id);
    if (!product) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ product: withAbsoluteProductImages(product) });
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 503 });
  }
}
