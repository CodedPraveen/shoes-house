import { getAdminErrorStatus, requireAdmin } from "@/lib/admin-auth";
import { readStagedImage, sniffInputMime } from "@/lib/image-storage";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    await requireAdmin();
    const { imageId } = await params;
    const file = await readStagedImage(imageId);
    const mimeType = sniffInputMime(file);
    if (!mimeType) return new Response("Not found", { status: 404 });
    return new Response(file, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    return new Response(status === 500 ? "Not found" : "Unauthorized", {
      status: status === 500 ? 404 : status,
    });
  }
}
