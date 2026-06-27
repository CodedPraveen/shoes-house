import SectionReveal from "@/components/section-reveal";
import NewsletterForm from "@/components/newsletter-form";

export default function NewsletterSection() {
  return (
    <SectionReveal className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] no54123-[2rem] border border-black/10 bg-zinc-100 px-6 py-12 sm:px-5 lg:px-14">
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
          <NewsletterForm />
        </div>
      </div>
    </SectionReveal>
  );
}
