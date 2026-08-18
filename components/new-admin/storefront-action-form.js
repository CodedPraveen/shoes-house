"use client";

import { useState } from "react";

export default function StorefrontActionForm({
  action,
  children,
  className = "",
  errorMessage = "This action could not be completed. Please try again.",
}) {
  const [error, setError] = useState("");

  async function submit(formData) {
    setError("");

    try {
      await action(formData);
    } catch (actionError) {
      setError(
        process.env.NODE_ENV === "development" && actionError?.message
          ? actionError.message
          : errorMessage,
      );
    }
  }

  return (
    <form action={submit} className={className}>
      {children}
      {error ? (
        <p className="text-xs text-rose-600 sm:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
