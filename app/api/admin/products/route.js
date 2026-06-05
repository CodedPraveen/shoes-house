import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { productService } from "@/services/product-service";
import { productAdminService } from "@/services/product-admin-service";

export async function GET() {
  try {
    await requireAdmin();
    await assertRateLimit({ prefix: "admin-api-products", limit: 60, windowMs: 60_000 });
    const products = await productService.getAll();
    return NextResponse.json({ products });
  } catch (err) {
    const status = err.message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await assertRateLimit({ prefix: "admin-api-products", limit: 20, windowMs: 60_000 });
    const body = await request.json();
    const product = await productAdminService.create(body);
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    const status =
      err.message === "Forbidden" ? 403 : err.code === "RATE_LIMITED" ? 429 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}
