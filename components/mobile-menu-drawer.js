"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_NAV, NAV_LINKS } from "@/lib/constants";

export default function MobileMenuDrawer({ open, onClose }) {
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
            className="fixed right-0 top-0 z-50 flex h-full w-[min(100%,320px)] flex-col bg-white shadow-2xl md:hidden"
          >
            <div className="border-b border-black/10 px-5 py-6">
            <p className="text-lg font-semibold tracking-[0.2em]">SHOES HOUSE</p>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block rounded-xl px-4 py-3 text-sm transition hover:bg-black/5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mb-2 mt-8 px-4 text-xs uppercase tracking-[0.2em] text-black/45">
                Categories
              </p>
              <ul className="space-y-1">
                {CATEGORY_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block rounded-xl px-4 py-3 text-sm text-black/75 transition hover:bg-black/5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
