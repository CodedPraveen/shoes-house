"use server";

import { auth } from "@clerk/nextjs/server";
import { reverseGeocode } from "@/lib/reverse-geocode";
import { assertRateLimit } from "@/lib/rate-limit";

export async function reverseGeocodeAction(lat, lon) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await assertRateLimit({ prefix: "geocode", limit: 10, windowMs: 60_000 });

  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("Invalid coordinates");
  }

  return reverseGeocode(lat, lon);
}
