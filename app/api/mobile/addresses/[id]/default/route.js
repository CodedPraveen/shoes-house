import { addressService } from "@/services/address-service";
import { invalidMobileRequest, withMobileUser } from "@/lib/mobile-api";

export async function POST(request, { params }) {
  const { id } = await params;
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(id)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const address = await addressService.setDefault(user.id, id);
    if (!address) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ address });
  }, { mutation: true });
}
