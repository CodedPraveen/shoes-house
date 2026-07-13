import SectionReveal from "@/components/section-reveal";
import NewsletterForm from "@/components/newsletter-form";
import JewelleryContainer from "@/components/jewellery/jewellery-container";

export default function JewelleryNewsletter() {
  return (
    <SectionReveal className="pb-20 pt-4 sm:pb-24">
      <JewelleryContainer>
        <div className="rounded-2xl border border-[#c5c7c1]/30 bg-[#f6f3f4] px-6 py-12 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#575757]">
              Newsletter
            </p>
            <h2 className="font-[family-name:var(--font-jewellery-display)] text-3xl font-semibold tracking-tight text-[#1b1b1c] sm:text-4xl">
              Join the Icon Circle
            </h2>
            <p className="text-sm leading-relaxed text-[#575757] sm:text-base">
              Exclusive previews, new collection alerts, and styling edits
              delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </JewelleryContainer>
    </SectionReveal>
  );
}
