"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

import AuthNav from "@/components/auth-nav";

import ShoesMobileMenuDrawer from "@/components/shoes/mobile-menu-drawer";
import JewelleryMobileMenuDrawer from "@/components/jewellery/mobile-menu-drawer";

import ShoesCategoriesDropdown from "@/components/shoes/categories-dropdown";
import ShoesDropdown from "@/components/shoes/collection-dropdown";

import JewelleryCategoriesDropdown from "@/components/jewellery/categories-dropdown";
import JewelleryDropdown from "@/components/jewellery/collection-dropdown";

import {
  SHOES_NAV_LINKS,
  JEWELLERY_NAV_LINKS,
} from "@/lib/constants";

import { useCart } from "@/hooks/use-cart";
import { useSearchContext } from "@/context/search-context";

export default function Navbar({
  categories,
  collection = "SHOES",
  homeHref,
  managedNavItems = null,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [shoesOpen, setShoesOpen] = useState(false);

  const { itemCount } = useCart();
  const { openSearch } = useSearchContext();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const hasManagedNavigation = Array.isArray(managedNavItems);
  const navLinks = hasManagedNavigation
    ? managedNavItems
    : collection === "JEWELLERY"
      ? JEWELLERY_NAV_LINKS
      : SHOES_NAV_LINKS;

  const shouldPrefetch = (href) => {
    return href === "/new-arrivals" || href === "/trending";
  };

  const renderLogo = ({ mobile = false } = {}) => {
    return (
      <Image
        src="/logo-postmart.webp"
        alt="Post Mart"
        width={250}
        height={64}
        priority
        className={
          mobile
            ? "block h-auto w-[126px] sm:w-[145px]"
            : "block h-auto w-[165px] lg:w-[180px] xl:w-[190px]"
        }
      />
    );
  };

  return (
    <>
      <header
        className={[
          "fixed inset-x-0 top-0 z-50",
          "transition-all duration-300",
          scrolled
            ? "border-b border-black/10 bg-white/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl"
            : "bg-white/95 backdrop-blur-md",
        ].join(" ")}
      >
        <nav
          className="
            mx-auto
            flex
            h-[64px]
            w-full
            max-w-[1440px]
            items-center
            px-4
            sm:h-[68px]
            sm:px-6
            lg:h-[72px]
            lg:px-8
            xl:px-10
          "
        >
          {/* =========================================================
              MOBILE / TABLET
              ========================================================= */}

          <div className="relative flex w-full items-center justify-between lg:hidden">
            {/* LEFT — MENU */}
            <div className="flex w-12 items-center justify-start sm:w-14">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  transition
                  hover:bg-black/5
                  active:scale-95
                "
                aria-label="Open menu"
              >
                <Menu
                  size={22}
                  strokeWidth={1.8}
                  className="text-[#0A192F]"
                />
              </button>
            </div>

            {/* CENTER — LOGO */}
            <Link
              href={homeHref}
              aria-label="Post Mart home"
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                flex
                items-center
                justify-center
              "
            >
              {renderLogo({ mobile: true })}
            </Link>

            {/* RIGHT — SEARCH + CART */}
            <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={openSearch}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  transition
                  hover:bg-black/5
                  active:scale-95
                "
                aria-label="Search"
              >
                <Search
                  size={20}
                  strokeWidth={1.8}
                  className="text-[#0A192F]"
                />
              </button>

              <Link
                href="/cart"
                prefetch={true}
                className="
                  relative
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  transition
                  hover:bg-black/5
                  active:scale-95
                "
                aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
              >
                <ShoppingBag
                  size={20}
                  strokeWidth={1.8}
                  className="text-[#0A192F]"
                />

                {itemCount > 0 && (
                  <span
                    className="
                      absolute
                      right-1
                      top-0.5
                      flex
                      h-[17px]
                      min-w-[17px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#0A192F]
                      px-1
                      text-[9px]
                      font-semibold
                      leading-none
                      text-white
                    "
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* =========================================================
              DESKTOP
              ========================================================= */}

          <div className="hidden w-full items-center lg:flex">
            {/* LEFT — LOGO */}
            <div className="flex shrink-0 items-center">
              <Link
                href={homeHref}
                aria-label="Post Mart home"
                className="flex items-center"
              >
                {renderLogo()}
              </Link>
            </div>

            {/* CENTER — NAVIGATION */}
            <div className="flex min-w-0 flex-1 items-center justify-center px-6 xl:px-10">
              <ul className="flex items-center gap-5 whitespace-nowrap xl:gap-7">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={shouldPrefetch(item.href)}
                      className="
                        text-[13px]
                        font-semibold
                        tracking-[-0.01em]
                        text-black/75
                        transition
                        hover:text-black
                      "
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                {hasManagedNavigation ? null : collection === "JEWELLERY" ? (
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
            </div>

            {/* RIGHT — ACTIONS */}
            <div className="flex shrink-0 items-center justify-end">
              <div className="flex items-center gap-1 xl:gap-2">
                {/* SEARCH */}
                <button
                  type="button"
                  onClick={openSearch}
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-black/5
                  "
                  aria-label="Search"
                >
                  <Search
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#0A192F]"
                  />
                </button>

                {/* CART */}
                <Link
                  href="/cart"
                  prefetch={true}
                  className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    transition
                    hover:bg-black/5
                  "
                  aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
                >
                  <ShoppingBag
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#0A192F]"
                  />

                  {itemCount > 0 && (
                    <span
                      className="
                        absolute
                        right-0
                        top-0
                        flex
                        h-[17px]
                        min-w-[17px]
                        items-center
                        justify-center
                        rounded-full
                        bg-[#0A192F]
                        px-1
                        text-[9px]
                        font-semibold
                        leading-none
                        text-white
                      "
                    >
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>

                {/* ACCOUNT */}
                <div className="ml-1 flex items-center">
                  <AuthNav />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* =========================================================
          MOBILE DRAWER
          ========================================================= */}

      {hasManagedNavigation ? (
        menuOpen ? <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(22rem,88vw)] bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><p className="font-semibold">Shop Post Mart</p><button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 hover:bg-black/5"><X size={20} /></button></div><nav className="mt-8 space-y-1">{managedNavItems.map((item) => <Link key={item.id} href={item.href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-medium hover:bg-black/5">{item.label}</Link>)}</nav></aside></div> : null
      ) : collection === "JEWELLERY" ? (
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
