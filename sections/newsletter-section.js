import SectionReveal from "@/components/section-reveal";
import NewsletterForm from "@/components/newsletter-form";

export default function NewsletterSection() {
  return (
    <SectionReveal className="px-5 py-12 sm:px-8 sm:py-16 lg:py-24" loading="lazy">
      <div className="mx-auto w-full max-w-[1400px] overflow-hidden rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#f5f5f4_0%,#e7e5e4_100%)] px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
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
