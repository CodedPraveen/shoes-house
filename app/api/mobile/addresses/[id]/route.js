import { addressService } from "@/services/address-service";
import { mobileAddressSchema } from "@/lib/mobile-address-schema";
import { invalidMobileRequest, parseMobileJson, withMobileUser } from "@/lib/mobile-api";

function validId(id) {
  return /^[A-Za-z0-9_-]{1,100}$/.test(id);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await parseMobileJson(request, mobileAddressSchema);
  if (!validId(id) || !body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      const address = await addressService.update(user.id, id, body);
      if (!address) return Response.json({ error: "Not found" }, { status: 404 });
      return Response.json({ address });
    } catch {
      return invalidMobileRequest();
    }
  }, { mutation: true });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  if (!validId(id)) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    const result = await addressService.remove(user.id, id);
    if (!result.count) return Response.json({ error: "Not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  }, { mutation: true });
}
