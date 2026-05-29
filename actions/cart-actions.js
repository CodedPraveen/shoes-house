"use server";

/**
 * Placeholder server actions for future Stripe / order flow.
 * Cart currently uses client Context API + localStorage.
 */

export async function validateCartAction() {
  return { ok: true, message: "Cart validation stub — connect database later." };
}

export async function createCheckoutSessionAction() {
  return {
    ok: false,
    message: "Stripe checkout not configured. Add STRIPE_SECRET_KEY when ready.",
  };
}
