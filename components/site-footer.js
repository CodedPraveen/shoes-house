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
      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">

          {/* Brand */}
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-lg font-semibold tracking-[0.2em]">
              Shoes House
            </p>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-black/60 lg:mx-0">
              Elevated footwear for modern movement. Crafted with clean form and
              premium function.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-medium">
                  {col.title}
                </h4>

                <ul className="space-y-2 text-sm text-black/60">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        prefetch={false}
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
      </div>

      <div className="border-t border-black/10 px-4 py-5 text-center text-xs text-black/45">
        Copyright {new Date().getFullYear()} Shoes House. All rights reserved.
      </div>
    </footer>
  );
}

