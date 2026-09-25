import { productService } from "@/services/product-service";
import { withAbsoluteProductImages } from "@/lib/mobile-product-images";

const ALLOWED_SORTS = new Set(["latest", "popular", "price-asc", "price-desc"]);

export async function GET(request) {
  const query = new URL(request.url).searchParams;
  const page = Number(query.get("page") ?? 1);
  const pageSize = Number(query.get("pageSize") ?? 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return Response.json({ error: "Invalid pagination" }, { status: 400 });
  }

  const sort = query.get("sort") ?? "latest";
  if (!ALLOWED_SORTS.has(sort)) {
    return Response.json({ error: "Invalid sort" }, { status: 400 });
  }

  const sizes = query.getAll("size").map(Number);
  if (sizes.some((size) => !Number.isInteger(size) || size < 1)) {
    return Response.json({ error: "Invalid size" }, { status: 400 });
  }

  const search = query.get("q")?.trim() ?? "";
  if (search.length > 100) {
    return Response.json({ error: "Search is too long" }, { status: 400 });
  }

  try {
    const products = await productService.search({
      query: search,
      category: query.get("category") || null,
      sizes,
      colors: query.getAll("color"),
      priceRanges: query.getAll("priceRange"),
    }, sort);
    const start = (page - 1) * pageSize;
    return Response.json({
      items: products.slice(start, start + pageSize).map((product) => withAbsoluteProductImages(product)),
      page,
      pageSize,
      total: products.length,
      hasMore: start + pageSize < products.length,
    });
  } catch {
    return Response.json({ error: "Catalog unavailable" }, { status: 503 });
  }
}
