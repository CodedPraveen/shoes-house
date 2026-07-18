"use client";

import Image from "next/image";
import { useState } from "react";

export default function SafeImage({
    src,
    fallback = "/placeholder.webp",
    alt,
    ...props
}) {
    const [imageSrc, setImageSrc] = useState(src);

    return (
        <SafeImage
            {...props}
            src={imageSrc}
            alt={alt}
            onError={() => {
                setImageSrc(fallback);
            }}
        />
    );
}