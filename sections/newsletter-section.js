import SectionReveal from "@/components/section-reveal";

export default function NewsletterSection() {
  return (
    <SectionReveal className="px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto w-full max-w-[1400px] rounded-[2rem] border border-black/10 bg-zinc-100 px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">
            Newsletter
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Get exclusive drops and style updates.
          </h2>
          <p className="text-sm text-black/60 sm:text-base">
            Join our list for early access, limited release notifications, and
            insider edits.
          </p>
          <form className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-full border border-black/15 bg-white px-5 text-sm outline-none ring-black/20 transition focus:ring-2"
            />
            <button
              type="submit"
              className="h-12 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:scale-[1.02]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </SectionReveal>
  );
}
