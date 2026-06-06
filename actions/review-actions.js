"use server";

import { auth } from "@clerk/nextjs/server";
import { assertRateLimit } from "@/lib/rate-limit";

/** Phase 6 — rate limit ready for review submissions */
export async function submitReviewAction() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await assertRateLimit({ prefix: "reviews", limit: 5, windowMs: 60_000 });

  return {
    ok: false,
    error: "Reviews system launches in Phase 6.",
  };
}
