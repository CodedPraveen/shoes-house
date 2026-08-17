"use client";

import Link from "next/link";
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 250 64"
        fill="none"
        role="img"
        aria-label="Post Mart"
        className={
          mobile
            ? "block h-auto w-[126px] sm:w-[145px]"
            : "block h-auto w-[165px] lg:w-[180px] xl:w-[190px]"
        }
        preserveAspectRatio="xMidYMid meet"
      >
        <g fill="#0A192F" transform="translate(25 20)">
          <path d="M0 23.5909V0.318182H10.0455C11.7727 0.318182 13.2841 0.659091 14.5795 1.34091C15.875 2.02273 16.8826 2.98106 17.6023 4.21591C18.322 5.45076 18.6818 6.89394 18.6818 8.54545C18.6818 10.2121 18.3106 11.6553 17.5682 12.875C16.8333 14.0947 15.7992 15.0341 14.4659 15.6932C13.1402 16.3521 11.5909 16.6818 9.81818 16.6818H3.81818V11.7727H8.54545C9.28788 11.7727 9.92045 11.6439 10.4432 11.3864C10.9735 11.1212 11.3788 10.7462 11.6591 10.2614C11.947 9.77652 12.0909 9.20455 12.0909 8.54545C12.0909 7.87879 11.947 7.31061 11.6591 6.84091C11.3788 6.36364 10.9735 6 10.4432 5.75C9.92045 5.49242 9.28788 5.36364 8.54545 5.36364H6.31818V23.5909H0Z" />

          <path d="M44.5455 11.9545C44.5455 14.5455 44.0417 16.7311 43.0341 18.5114C42.0265 20.2841 40.6667 21.6288 38.9545 22.5455C37.2424 23.4545 35.3333 23.9091 33.2273 23.9091C31.1061 23.9091 29.1894 23.4508 27.4773 22.5341C25.7727 21.6098 24.4167 20.2614 23.4091 18.4886C22.4091 16.7083 21.9091 14.5303 21.9091 11.9545C21.9091 9.36364 22.4091 7.18182 23.4091 5.40909C24.4167 3.62879 25.7727 2.28409 27.4773 1.375C29.1894 0.458333 31.1061 0 33.2273 0C35.3333 0 37.2424 0.458333 38.9545 1.375C40.6667 2.28409 42.0265 3.62879 43.0341 5.40909C44.0417 7.18182 44.5455 9.36364 44.5455 11.9545ZM38.0455 11.9545C38.0455 10.5606 37.8598 9.38636 37.4886 8.43182C37.125 7.4697 36.5833 6.74242 35.8636 6.25C35.1515 5.75 34.2727 5.5 33.2273 5.5C32.1818 5.5 31.2992 5.75 30.5795 6.25C29.8674 6.74242 29.3258 7.4697 28.9545 8.43182C28.5909 9.38636 28.4091 10.5606 28.4091 11.9545C28.4091 13.3485 28.5909 14.5265 28.9545 15.4886C29.3258 16.4432 29.8674 17.1705 30.5795 17.6705C31.2992 18.1629 32.1818 18.4091 33.2273 18.4091C34.2727 18.4091 35.1515 18.1629 35.8636 17.6705C36.5833 17.1705 37.125 16.4432 37.4886 15.4886C37.8598 14.5265 38.0455 13.3485 38.0455 11.9545Z" />

          <path d="M61.0142 7.59091C60.9536 6.83333 60.6695 6.24242 60.1619 5.81818C59.6619 5.39394 58.9006 5.18182 57.8778 5.18182C57.2263 5.18182 56.6922 5.26136 56.2756 5.42045C55.8665 5.57197 55.5634 5.7803 55.3665 6.04545C55.1695 6.31061 55.0672 6.61364 55.0597 6.95455C55.0445 7.23485 55.0937 7.48864 55.2074 7.71591C55.3286 7.93561 55.518 8.13636 55.7756 8.31818C56.0331 8.49242 56.3627 8.65152 56.7642 8.79545C57.1657 8.93939 57.643 9.06818 58.196 9.18182L60.1051 9.59091C61.393 9.86364 62.4953 10.2235 63.4119 10.6705C64.3286 11.1174 65.0786 11.6439 65.6619 12.25C66.2453 12.8485 66.6733 13.5227 66.946 14.2727C67.2263 15.0227 67.3703 15.8409 67.3778 16.7273C67.3703 18.2576 66.9877 19.553 66.2301 20.6136C65.4725 21.6742 64.3892 22.4811 62.9801 23.0341C61.5786 23.5871 59.893 23.8636 57.9233 23.8636C55.9006 23.8636 54.1354 23.5644 52.6278 22.9659C51.1278 22.3674 49.9612 21.447 49.1278 20.2045C48.3021 18.9545 47.8854 17.3561 47.8778 15.4091H53.8778C53.9157 16.1212 54.0938 16.7197 54.4119 17.2045C54.7301 17.6894 55.1771 18.0568 55.7528 18.3068C56.3362 18.5568 57.0294 18.6818 57.8324 18.6818C58.5066 18.6818 59.071 18.5985 59.5256 18.4318C59.9801 18.2652 60.3248 18.0341 60.5597 17.7386C60.7945 17.4432 60.9157 17.1061 60.9233 16.7273C60.9157 16.3712 60.7983 16.0606 60.571 15.7955C60.3513 15.5227 59.9877 15.2803 59.4801 15.0682C58.9725 14.8485 58.2869 14.6439 57.4233 14.4545L55.1051 13.9545C53.0445 13.5076 51.4195 12.7614 50.2301 11.7159C49.0485 10.6629 48.4612 9.22727 48.4688 7.40909C48.4612 5.93182 48.8551 4.64015 49.6506 3.53409C50.4536 2.42045 51.5634 1.55303 52.9801 0.931818C54.4044 0.310606 56.0369 0 57.8778 0C59.7566 0 61.3816 0.314394 62.7528 0.943182C64.1241 1.57197 65.1809 2.45833 65.9233 3.60227C66.6733 4.73864 67.0521 6.06818 67.0597 7.59091H61.0142Z" />

          <path d="M70.1449 5.40909V0.318182H90.3722V5.40909H83.3722V23.5909H77.1449V5.40909H70.1449Z" />

          <path d="M101.125 0.318182H108.989L114.398 13.5H114.67L120.08 0.318182H127.943V23.5909H121.761V10.1364H121.58L116.398 23.4091H112.67L107.489 10.0455H107.307V23.5909H101.125V0.318182Z" />

          <path d="M137.983 23.5909H131.165L138.847 0.318182H147.483L155.165 23.5909H148.347L143.256 6.72727H143.074L137.983 23.5909ZM136.71 14.4091H149.528V19.1364H136.71V14.4091Z" />

          <path d="M158.406 23.5909V0.318182H168.452C170.179 0.318182 171.69 0.632576 172.986 1.26136C174.281 1.89015 175.289 2.79546 176.009 3.97727C176.728 5.15909 177.088 6.57576 177.088 8.22727C177.088 9.89394 176.717 11.2992 175.974 12.4432C175.24 13.5871 174.205 14.4508 172.872 15.0341C171.546 15.6174 169.997 15.9091 168.224 15.9091H162.224V11H166.952C167.694 11 168.327 10.9091 168.849 10.7273C169.38 10.5379 169.785 10.2386 170.065 9.82955C170.353 9.42046 170.497 8.88636 170.497 8.22727C170.497 7.56061 170.353 7.01894 170.065 6.60227C169.785 6.17803 169.38 5.86742 168.849 5.67045C168.327 5.46591 167.694 5.36364 166.952 5.36364H164.724V23.5909H158.406Z" />

          <path d="M172.043 12.9091L177.861 23.5909H170.997L165.315 12.9091H172.043Z" />

          <path d="M180.145 5.40909V0.318182H200.372V5.40909H193.372V23.5909H187.145V5.40909H180.145Z" />
        </g>
      </svg>
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
