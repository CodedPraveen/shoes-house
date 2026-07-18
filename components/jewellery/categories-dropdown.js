"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { JEWELLERY_CATEGORY } from "@/lib/constants";

export default function JewelleryCategoriesDropdown({
    open,
    onOpen,
    onClose,
}) {
    return (
        <li
            className="relative"
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
        >
            <button
                type="button"
                className="text-black/75 transition hover:text-black"
                aria-expanded={open}
            >
                Categories
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 top-full z-50 mt-4 w-48 -translate-x-1/2 overflow-hidden no54123-2xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
                    >
                        <ul className="space-y-1">
                            {JEWELLERY_CATEGORY.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="block no54123-xl px-4 py-3 text-sm text-black/75 transition hover:bg-black/5 hover:text-black"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}