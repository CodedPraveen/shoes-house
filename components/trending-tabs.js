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

const PRODUCTS_PER_PANEL = 4;

function chunkProducts(products, size) {
    const chunks = [];

    for (let i = 0; i < products.length; i += size) {
        chunks.push(products.slice(i, i + size));
    }

    return chunks;
}

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

    const productPanels = chunkProducts(
        filteredProducts.slice(0, 16),
        PRODUCTS_PER_PANEL,
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
          STACKED PRODUCT PANELS
      ========================== */}
            {productPanels.length > 0 ? (
                <div className="mt-8 px-5">
                    <div className="relative">
                        {productPanels.map((panelProducts, panelIndex) => {
                            const panelNumber = panelIndex + 1;
                            const panelCount = productPanels.length;

                            return (
                                <section
                                    key={`${activeTab}-${panelIndex}`}
                                    className="
                                        sticky
                                        top-4
                                        mb-6
                                        overflow-hidden
                                        rounded-3xl
                                        border
                                        border-black/10
                                        bg-white
                                        shadow-[0_10px_40px_rgba(0,0,0,0.08)]
                                        transition-[transform,box-shadow]
                                        duration-500
                                        ease-out
                                        motion-reduce:transition-none
                                        sm:top-6
                                        sm:mb-8
                                        sm:rounded-[2rem]
                                    "
                                    style={{
                                        zIndex: panelNumber,
                                        top: `${88 + panelIndex * 18}px`,
                                    }}
                                >
                                    {/* =========================
                                      PANEL HEADER
                                  ========================== */}
                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            px-5
                                            pt-5
                                            sm:px-8
                                            sm:pt-7
                                        "
                                    >
                                        <span
                                            className="
                                                inline-flex
                                                items-center
                                                rounded-full
                                                border
                                                border-black/10
                                                px-3
                                                py-1.5
                                                text-[10px]
                                                font-medium
                                                uppercase
                                                tracking-[0.18em]
                                                text-black/55
                                                sm:px-4
                                                sm:py-2
                                                sm:text-xs
                                            "
                                        >
                                            {panelNumber}/{panelCount}
                                        </span>

                                        <span
                                            className="
                                                text-[10px]
                                                uppercase
                                                tracking-[0.18em]
                                                text-black/35
                                                sm:text-xs
                                            "
                                        >
                                            Most wanted
                                        </span>
                                    </div>

                                    {/* =========================
                                      PRODUCTS
                                  ========================== */}
                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-x-2
                                            gap-y-6
                                            px-5
                                            pb-6
                                            pt-5

                                            sm:grid-cols-2
                                            sm:gap-x-3
                                            sm:gap-y-8
                                            sm:px-8
                                            sm:pb-8
                                            sm:pt-6

                                            lg:grid-cols-4
                                            lg:gap-x-5
                                            lg:gap-y-0
                                            lg:px-8
                                            lg:pb-8
                                        "
                                    >
                                        {panelProducts.map(
                                            (product, productIndex) => {
                                                const globalIndex =
                                                    panelIndex *
                                                    PRODUCTS_PER_PANEL +
                                                    productIndex;

                                                return (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={{
                                                            ...product,
                                                            rank:
                                                                globalIndex + 1,
                                                        }}
                                                        showRank={
                                                            globalIndex < 3
                                                        }
                                                    />
                                                );
                                            },
                                        )}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="px-5">
                    <div className="py-20 text-center">
                        No products found
                    </div>
                </div>
            )}
        </>
    );
}