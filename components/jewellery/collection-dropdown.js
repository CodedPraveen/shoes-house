"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

// const MENU_DATA = {
//     featured: [
//         {
//             title: "Bridal Collection",
//             image: "/jewellery/bridal.jpg",
//             href: "/jewellery/collections/bridal",
//         },
//         {
//             title: "Daily Wear",
//             image: "/jewellery/daily.jpg",
//             href: "/jewellery/collections/daily",
//         },
//         {
//             title: "Gift Collection",
//             image: "/jewellery/gift.jpg",
//             href: "/jewellery/collections/gift",
//         },
//     ],
// };

export default function JewelleryDropdown({
    categories,
    open,
    onOpen,
    onClose,
}) {
    return (
        <li
            className="static"
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
        >
            <button
                type="button"
                aria-expanded={open}
                className="text-black/75 transition hover:text-black"
            >
                Jewellery
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4 }}
                        className="
    absolute
    left-0
    top-full
    z-50
    w-screen
    border-t
    border-black/10
    bg-white
    shadow-xl
  ">
                        <div className="mx-auto max-w-7xl px-8 py-10 flex justify-center items-center font-bold">
                            <div className="grid grid-cols-12 justify-center">
                                <div className="col-span-2">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                                        Shop
                                    </h3>

                                    <ul className="space-y-3">
                                        {categories.map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={`/category/${category.slug}`}
                                                    className="text-sm text-black/70 transition hover:text-black"
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="col-span-4">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                                        Categories
                                    </h3>

                                    <ul className="space-y-3">
                                        {categories.map((category) => (
                                            <li key={category.id}>
                                                <Link
                                                    href={`/jewellery?category=${category.slug}`}
                                                    className="text-sm text-black/70 transition hover:text-black"
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}
