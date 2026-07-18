"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const MENU_DATA = {
    featured: [
        {
            title: "Bridal Collection",
            image: "/jewellery/bridal.jpg",
            href: "/jewellery/collections/bridal",
        },
        {
            title: "Daily Wear",
            image: "/jewellery/daily.jpg",
            href: "/jewellery/collections/daily",
        },
        {
            title: "Gift Collection",
            image: "/jewellery/gift.jpg",
            href: "/jewellery/collections/gift",
        },
    ],
};

export default function ShoesDropdown({
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

                                <div className="col-span-2">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                                        Men
                                    </h3>

                                    <ul className="space-y-3">
                                        {MENU_DATA.men.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="text-sm text-black/70 transition hover:text-black"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                                        Women
                                    </h3>

                                    <ul className="space-y-3">
                                        {MENU_DATA.women.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="text-sm text-black/70 transition hover:text-black"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-span-6">
                                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider">
                                        Featured Collection
                                    </h3>

                                    <div className="grid grid-cols-3 gap-4">
                                        {MENU_DATA.featured.map((product) => (
                                            <Link
                                                key={product.title}
                                                href={product.href}
                                                className="
                        group
                        overflow-hidden
                        no54123-2xl
                        border
                        border-black/10
                        bg-neutral-50
                      "
                                            >
                                                <div className="relative aspect-square overflow-hidden">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.title}
                                                        fill
                                                        className="
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-110
                          "
                                                    />
                                                </div>

                                                <div className="p-4">
                                                    <h4 className="text-sm font-semibold">
                                                        {product.title}
                                                    </h4>

                                                    <p className="mt-1 text-sm text-black/60">
                                                        {product.price}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </li>
    );
}
