"use server";

import { newsletterService } from "@/services/newsletter-service";

export async function subscribeNewsletterAction(formData) {
  const email = formData.get("email");
  if (!email || typeof email !== "string") {
    return { ok: false, error: "Email required" };
  }

  try {
    await newsletterService.subscribe(email);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "Subscribe failed" };
  }
}
