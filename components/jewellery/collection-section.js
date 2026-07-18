import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionReveal from "@/components/section-reveal";
import JewelleryContainer from "@/components/jewellery/jewellery-container";
import { cn } from "@/lib/utils";
import SafeImage from "../ui/safe-image";

export default function CollectionSection({
  eyebrow,
  title,
  description,
  ctaLabel,
  href,
  image,
  imageAlt,
  tone = "from-[#f7e7ce]/80 to-[#fdfcfb]",
  reverse = false,
}) {
  return (
    <SectionReveal className="overflow-hidden bg-[#f6f3f4] py-16 sm:py-12">
      <JewelleryContainer>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className={cn(
              "relative h-[360px] overflow-hidden rounded-xl shadow-xl sm:h-[480px] lg:h-[600px]",
              "bg-gradient-to-br",
              tone,
              reverse && "lg:order-2",
            )}
          >
            <SafeImage
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className={cn("px-0 sm:px-4 lg:px-8", reverse && "lg:order-1")}>
            <span className="mb-4 block text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
              {eyebrow}
            </span>
            <h2 className="mb-4 font-[family-name:var(--font-jewellery-display)] text-3xl font-semibold tracking-tight text-[#1b1b1c] sm:text-[48px] sm:leading-[1.1]">
              {title}
            </h2>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-[#575757] sm:text-lg">
              {description}
            </p>
            <Link
              href={href}
              className="group inline-flex items-center gap-2 border-b-2 border-[#1b1b1c] pb-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] transition hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              {ctaLabel}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </JewelleryContainer>
    </SectionReveal>
  );
}
