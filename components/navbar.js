"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag } from "lucide-react";
import AuthNav from "@/components/auth-nav";
import ShoesMobileMenuDrawer from "@/components/shoes/mobile-menu-drawer";
import JewelleryMobileMenuDrawer from "@/components/jewellery/mobile-menu-drawer";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useSearchContext } from "@/context/search-context";
import { SHOES_NAV_LINKS, JEWELLERY_NAV_LINKS, } from "@/lib/constants";
import ShoesCategoriesDropdown from "@/components/shoes/categories-dropdown";
import ShoesDropdown from "@/components/shoes/collection-dropdown";
import JewelleryCategoriesDropdown from "@/components/jewellery/categories-dropdown";
import JewelleryDropdown from "@/components/jewellery/collection-dropdown";

export default function Navbar({ categories, collection = "SHOES", homeHref, }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [shoesOpen, setShoesOpen] = useState(false);
  const { itemCount } = useCart();
  const { openSearch } = useSearchContext();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks =
    collection === "JEWELLERY"
      ? JEWELLERY_NAV_LINKS
      : SHOES_NAV_LINKS;

  const logoHref =
    collection === "JEWELLERY"
      ? "/jewellery"
      : "/";


  const shouldPrefetch = (href) => {
    return href === "/new-arrivals" || href === "/trending";
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
          ? "border-b border-black/5 bg-white/75 backdrop-blur-xl"
          : "bg-transparent"
          }`}
      >
        <nav className="mx-auto flex h-20 w-full max-w-350 items-center justify-between px-5 sm:px-8">
          <Link href={homeHref} className="pl-4 md:pl-8
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="180" height="auto" viewBox="0 0 280 64" fill="none">
              <g fill="#0A192F">
            
                <text x="25"
                  y="45"
                  fontFamily="Inter, Poppins, Montserrat, Arial, sans-serif"
                  fontSize="34"
                  fontWeight="800"
                  letterSpacing="1"
                  fill="#0A192F">
                  POST MART
                </text>
              </g>
            </svg>
          </Link>


          <ul className="hidden items-center gap-8 text-sm md:flex font-bold  ">
        
            {navLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={shouldPrefetch(item.href)}
                  className="text-black/75 transition hover:text-black"
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {collection === "JEWELLERY" ? (
              <>
                <JewelleryCategoriesDropdown
                  open={categoriesOpen}
                  onOpen={() => setCategoriesOpen(true)}
                  onClose={() => setCategoriesOpen(false)}
                />

                <JewelleryDropdown
                  categories={categories}
                  open={shoesOpen}
                  onOpen={() => setShoesOpen(true)}
                  onClose={() => setShoesOpen(false)}
                />
              </>
            ) : (
              <>
                <ShoesCategoriesDropdown
                  open={categoriesOpen}
                  onOpen={() => setCategoriesOpen(true)}
                  onClose={() => setCategoriesOpen(false)}
                />

                <ShoesDropdown
                  categories={categories}
                  open={shoesOpen}
                  onOpen={() => setShoesOpen(true)}
                  onClose={() => setShoesOpen(false)}
                />
              </>
            )}

          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSearch}
              className="no54123-full p-2 transition hover:bg-black/5"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link
              href="/cart"
              prefetch={true}
              className="relative no54123-full p-2 transition hover:bg-black/5"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-se-xs bg-black px-1 text-[10px] text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <AuthNav />
            <button
              type="button"
              className="no54123-full p-2 md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {collection === "JEWELLERY" ? (
        <JewelleryMobileMenuDrawer
          categories={categories}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      ) : (
        <ShoesMobileMenuDrawer
          categories={categories}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}

