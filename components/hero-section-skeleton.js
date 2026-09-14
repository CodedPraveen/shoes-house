export default function HeroSectionSkeleton() {
  return (
    <section className="mt-16 w-full" aria-label="Loading featured collections">
      <div className="flex gap-2 overflow-hidden lg:gap-2.5" aria-hidden>
        <div className="aspect-[2/3] w-full shrink-0 animate-pulse bg-zinc-200/70 sm:w-[60%] lg:w-[30%]" />
        <div className="hidden aspect-[2/3] shrink-0 animate-pulse bg-zinc-200/70 sm:block sm:w-[60%] lg:w-[30%]" />
        <div className="hidden aspect-[2/3] shrink-0 animate-pulse bg-zinc-200/70 lg:block lg:w-[30%]" />
      </div>
    </section>
  );
}
