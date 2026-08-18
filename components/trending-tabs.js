"use client";

import { useState } from "react";
import ProductCard from "@/components/product-card";

const tabs = [
    "all",
    "running",
    "football",
    "casual",
    "basketball",
];

export default function TrendingTabs({ initialProducts }) {
    const [activeTab, setActiveTab] = useState("all");

    const filteredProducts =
        activeTab === "all"
            ? initialProducts
            : initialProducts.filter(
                (product) =>
                    product.category?.slug === activeTab ||
                    product.tags?.includes(activeTab),
            );

    return (
        <>
            {/* =========================
          TABS
      ========================== */}
            <div className="flex gap-3 overflow-x-auto px-5 scrollbar-none">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`shrink-0 border px-5 py-2 text-sm transition ${activeTab === tab
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* =========================
          PRODUCTS
      ========================== */}
            <div
                className="
          mt-8
          grid
          grid-cols-2
          gap-x-2
          gap-y-8

          sm:gap-x-3
          sm:gap-y-10

          md:grid-cols-3
          md:gap-x-4

          lg:grid-cols-4
          lg:gap-x-5

          xl:grid-cols-4
        "
            >
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={{
                                ...product,
                                rank: index + 1,
                            }}
                            showRank={index < 3}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        No products found
                    </div>
                )}
            </div>
        </>
    );
}