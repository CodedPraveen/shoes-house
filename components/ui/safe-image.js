"use client";

import Image from "next/image";
import { useState } from "react";
import { validateImageSource } from "@/lib/product-image";

const DEFAULT_FALLBACK = "/jewellery/placeholder.svg";

export default function SafeImage({
    src,
    alt,
    fallback = DEFAULT_FALLBACK,
    onError,
    ...props
}) {
    const sourceValidation = validateImageSource(src, { allowLocal: true });
    const fallbackValidation = validateImageSource(fallback, { allowLocal: true });
    const fallbackSrc = fallbackValidation.isValid
        ? fallbackValidation.url
        : DEFAULT_FALLBACK;
    const sourceUrl = sourceValidation.isValid ? sourceValidation.url : null;
    const [failedSource, setFailedSource] = useState(null);
    const isFallback = !sourceUrl || failedSource === sourceUrl;
    const imageSrc = isFallback ? fallbackSrc : sourceUrl;

    return (
        <Image
            {...props}
            src={imageSrc}
            alt={alt || ""}
            onError={(event) => {
                if (!isFallback && sourceUrl) {
                    setFailedSource(sourceUrl);
                }
                try {
                    onError?.(event);
                } catch {
                    // Image failures must never escape this rendering boundary.
                }
            }}
        />
    );
}
