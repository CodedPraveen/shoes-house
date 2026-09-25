import { addressService } from "@/services/address-service";
import { mobileAddressSchema } from "@/lib/mobile-address-schema";
import { invalidMobileRequest, parseMobileJson, withMobileUser } from "@/lib/mobile-api";

export async function GET(request) {
  return withMobileUser(request, async (user) => Response.json({ items: await addressService.listByUser(user.id) }));
}

export async function POST(request) {
  const body = await parseMobileJson(request, mobileAddressSchema);
  if (!body) return invalidMobileRequest();
  return withMobileUser(request, async (user) => {
    try {
      const address = await addressService.create(user.id, body);
      return Response.json({ address }, { status: 201 });
    } catch {
      return invalidMobileRequest();
    }
  }, { mutation: true });
}
