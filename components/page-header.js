export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 px-5 py-16 sm:px-8 lg:py-20">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] text-black/45">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm text-black/60 sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
