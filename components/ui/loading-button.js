"use client";

export default function LoadingButton({
  loading = false,
  children,
  className = "",
  ...props
}) {
  return (
    <button
      type={props.type ?? "button"}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
