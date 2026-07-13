import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import { JEWELLERY_INSTAGRAM } from "@/data/jewellery-content";
import { cn } from "@/lib/utils";

export default function InstagramFeed() {
  return (
    <SectionReveal className="bg-[#f6f3f4] py-16 sm:py-20">
      <JewelleryContainer>
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-[#575757]">
            @aurum.luxe
          </p>
          <h2 className="font-[family-name:var(--font-jewellery-display)] text-2xl font-medium italic text-[#1b1b1c] sm:text-[32px]">
            Follow Our Journey
          </h2>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {JEWELLERY_INSTAGRAM.map(({ id, alt, tone }) => (
            <li key={id}>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={alt}
                className={cn(
                  "group block aspect-square overflow-hidden rounded-xl bg-gradient-to-br transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2",
                  tone,
                )}
              >
                <span className="sr-only">{alt}</span>
              </a>
            </li>
          ))}
        </ul>
      </JewelleryContainer>
    </SectionReveal>
  );
}
