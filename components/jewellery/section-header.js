import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "View All",
  centered = false,
  italic = false,
  className = "",
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:mb-10",
        centered
          ? "items-center text-center"
          : "items-start sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-2", centered && "max-w-2xl")}>
        <h2
          className={cn(
            "font-[family-name:var(--font-jewellery-display)] text-2xl font-medium tracking-tight text-[#1b1b1c] sm:text-[32px] sm:leading-[1.3]",
            italic && "italic",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#575757] sm:text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 border-b border-[#1b1b1c]/20 pb-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#1b1b1c] transition hover:border-[#1b1b1c]"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
