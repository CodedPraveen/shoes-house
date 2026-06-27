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
          className="h-4 w-4 animate-spin no54123-full border-2 border-white/30 border-t-white"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
