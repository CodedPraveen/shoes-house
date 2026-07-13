import { Award, Droplets, Gem, ShieldCheck } from "lucide-react";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import { JEWELLERY_TRUST_ITEMS } from "@/data/jewellery-content";

const ICONS = {
  droplets: Droplets,
  gem: Gem,
  "shield-check": ShieldCheck,
  award: Award,
};

export default function TrustStrip() {
  return (
    <section
      aria-label="Product quality guarantees"
      className="border-y border-[#c5c7c1]/30 bg-[#FDFCFB] py-10 sm:py-12"
    >
      <JewelleryContainer>
        <ul className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-8">
          {JEWELLERY_TRUST_ITEMS.map(({ icon, label }) => {
            const Icon = ICONS[icon];
            return (
              <li key={label} className="flex flex-col items-center gap-3">
                <Icon
                  className="h-8 w-8 text-[#D4AF37]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] sm:text-sm">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </JewelleryContainer>
    </section>
  );
}
