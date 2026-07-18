"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_NAV, NAV_LINKS } from "@/lib/constants";
import { SHOES_CATEGORY } from "@/lib/constants";
import { ChevronRight } from "lucide-react";
import SafeImage from "../ui/safe-image";

const MENU_DATA = {
  categories: [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Best Sellers", href: "/category/shoes" },
    { label: "All Sneakers", href: "/category/shoes" },
    { label: "Limited Edition", href: "/category/shoes" },
  ],

  men: [
    { label: "Running", href: "/men/running" },
    { label: "Lifestyle", href: "/men/lifestyle" },
    { label: "Casual", href: "/men/casual" },
    { label: "Training", href: "/men/training" },
  ],

  women: [
    { label: "Running", href: "/women/running" },
    { label: "Lifestyle", href: "/women/lifestyle" },
    { label: "Casual", href: "/women/casual" },
    { label: "Training", href: "/women/training" },
  ],

  featured: [
    {
      title: "AERÉ Velocity",
      price: "₹3,999",
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      href: "/product/aere-velocity",
    },
    {
      title: "AERÉ Phantom",
      price: "₹4,499",
      image:
        "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80",
      href: "/product/aere-phantom",
    },
    {
      title: "AERÉ Motion",
      price: "₹5,299",
      image:
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      href: "/product/aere-motion",
    },
  ],
};
export default function MobileMenuDrawer({
  categories,
  open,
  onClose,
}) {

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % MENU_DATA.featured.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-6">
              <p className="text-lg font-semibold tracking-[0.2em]">
                SHOES HOUSE
              </p>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 transition hover:bg-black/5"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <div className="overflow-hidden">
                <div className="relative h-44 w-full overflow-hidden">
                  <SafeImage
                    src={MENU_DATA.featured[currentImage].image}
                    alt={MENU_DATA.featured[currentImage].title}
                    fill
                    priority
                    className="object-cover transition-all duration-500"
                  />

                  <div className="absolute inset-0 bg-black/20" />

                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-semibold">
                      {MENU_DATA.featured[currentImage].title}
                    </p>

                    <p className="text-sm opacity-90">
                      {MENU_DATA.featured[currentImage].price}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 border-b border-black/10 text-center">
                  <Link href="/category/men">
                    <button className="py-4 text-sm font-semibold uppercase">
                      Men
                    </button>
                  </Link>

                  <Link href="/category/women">
                    <button className="py-4 text-sm font-semibold uppercase">
                      Women
                    </button>
                  </Link>

                  <Link href="/category/shoes">
                    <button className="py-4 text-sm font-semibold uppercase">
                      Shoes
                    </button>
                  </Link>
                </div>
              </div>
              <ul className="py-4">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      onClick={onClose}
                      className="
        flex
        items-center
        justify-between
        px-4
        py-4
        text-sm
        uppercase
        tracking-wider
      "
                    >
                      {category.name}
                      <ChevronRight size={16} />
                    </Link>
                  </li>
                ))}
              </ul>

           
            </nav>
          </motion.aside >
        </>
      )
      }
    </AnimatePresence >
  );
}
