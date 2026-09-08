import { readFile } from "node:fs/promises";
import { resolveImageStoragePath } from "@/lib/image-storage";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const segments = (await params).path;
    const file = await readFile(resolveImageStoragePath(segments.join("/")));
    return new Response(file, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
