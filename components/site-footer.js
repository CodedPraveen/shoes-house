import Link from "next/link";
import { FOOTER_LINKS } from "@/constants/routes";

export default function SiteFooter() {
  const columns = [
    { title: "Shop", links: FOOTER_LINKS.shop },
    { title: "Support", links: FOOTER_LINKS.support },
    { title: "Company", links: FOOTER_LINKS.company },
  ];

  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_2fr]">
        <div className="space-y-6">
          <p className="text-lg font-semibold tracking-[0.2em]">AERÉ</p>
          <p className="max-w-xs text-sm leading-relaxed text-black/60">
            Elevated footwear for modern movement. Crafted with clean form and
            premium function.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-sm font-medium">{col.title}</h4>
              <ul className="space-y-2 text-sm text-black/60">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-black/10 py-6 text-center text-xs text-black/45">
        Copyright {new Date().getFullYear()} AERÉ. All rights reserved.
      </div>
    </footer>
  );
}
