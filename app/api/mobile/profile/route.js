import { withMobileUser } from "@/lib/mobile-api";

export async function GET(request) {
  return withMobileUser(request, (user) => Response.json({
    profile: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  }));
}
