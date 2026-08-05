"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "../ui/safe-image";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";

const MENU_DATA = {
    categories: [
        { label: "New Arrivals", href: "/new-arrivals" },
        { label: "Best Sellers", href: "/best-sellers" },
        { label: "All Sneakers", href: "/shoes" },
        { label: "Limited Edition", href: "/limited-edition" },
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
                Shoes
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
                                                    <SafeImage
                                                        // src={product.image}
                                                        src={optimizeCloudinaryImage(product.image)}
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
