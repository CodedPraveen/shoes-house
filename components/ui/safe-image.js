"use client";

import Image from "next/image";
import { useState } from "react";

export default function SafeImage({
    src,
    alt,
    fallback = "/jewellery/placeholder.svg",
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(src || fallback);

    return (
        <Image
            {...props}
            src={imageSrc}
            alt={alt}
            onError={() => {
                if (imageSrc !== fallback) {
                    setImageSrc(fallback);
                }
            }}
        />
    );
}
