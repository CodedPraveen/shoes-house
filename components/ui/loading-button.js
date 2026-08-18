"use client";

import { useFormStatus } from "react-dom";

export default function LoadingButton({
  loading = false,
  children,
  className = "",
  disabled = false,
  type = "submit",
  ...props
}) {
  const { pending } = useFormStatus();
  const isLoading = loading || pending;

  return (
    <button
      {...props}
      type={type}
      disabled={isLoading || disabled}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
