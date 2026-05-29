"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import AuthNav from "@/components/auth-nav";
import CategoriesDropdown from "@/components/categories-dropdown";
import MobileMenuDrawer from "@/components/mobile-menu-drawer";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useSearchContext } from "@/context/search-context";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { itemCount } = useCart();
  const { openSearch } = useSearchContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-black/5 bg-white/75 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-lg font-semibold tracking-[0.25em]">
            AERÉ
          </Link>

          <ul className="hidden items-center gap-8 text-sm md:flex">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-black/75 transition hover:text-black"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <CategoriesDropdown
              open={categoriesOpen}
              onOpen={() => setCategoriesOpen(true)}
              onClose={() => setCategoriesOpen(false)}
            />
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSearch}
              className="rounded-full p-2 transition hover:bg-black/5"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link
              href="/cart"
              className="relative rounded-full p-2 transition hover:bg-black/5"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <AuthNav />
            <button
              type="button"
              className="rounded-full p-2 md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
