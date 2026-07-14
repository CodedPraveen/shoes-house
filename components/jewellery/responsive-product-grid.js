"use client";

import { useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";

export default function ResponsiveProductGrid({
    products,
    mobile = 4,
    tablet = 6,
    desktop = 8,
}) {
    const [count, setCount] = useState(desktop);

    useEffect(() => {
        const updateCount = () => {
            if (window.innerWidth < 640) {
                setCount(mobile);
            } else if (window.innerWidth < 1024) {
                setCount(tablet);
            } else {
                setCount(desktop);
            }
        };

        updateCount();

        window.addEventListener("resize", updateCount);
        return () => window.removeEventListener("resize", updateCount);
    }, [mobile, tablet, desktop]);

    return <ProductGrid products={products.slice(0, count)} />;
}