"use client";

import { useState, useTransition } from "react";
import { subscribeNewsletterAction } from "@/actions/newsletter-actions";

export default function NewsletterForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(formData) {
    setMessage("");
    startTransition(async () => {
      const result = await subscribeNewsletterAction(formData);
      setMessage(
        result.ok ? "You're subscribed. Thank you." : result.error || "Failed",
      );
    });
  }

  return (
    <>
      <form action={onSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="Enter your email"
          className="h-12 flex-1 no54123-full p-3 border border-black/15 bg-white px-5 text-sm outline-none ring-black/20 transition focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 no54123-full bg-black px-6 text-sm font-medium text-white transition hover:scale-[1.02] disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </form>
      {message ? (
        <p className="text-center text-sm text-black/70">{message}</p>
      ) : null}
    </>
  );
}
