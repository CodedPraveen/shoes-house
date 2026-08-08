"use server";

import { auth } from "@clerk/nextjs/server";
import { reverseGeocode } from "@/lib/reverse-geocode";
import { assertRateLimit } from "@/lib/rate-limit";

export async function reverseGeocodeAction(lat, lng) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await assertRateLimit({ prefix: "geocode", limit: 10, windowMs: 60_000 });

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    throw new Error("Invalid coordinates");
  }

  return reverseGeocode(lat, lng);
}
