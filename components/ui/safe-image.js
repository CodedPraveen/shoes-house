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
    onLoad,
    showPlaceholder = false,
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
    const [loadedSource, setLoadedSource] = useState(null);
    const isLoaded = loadedSource === imageSrc;

    return (
        <>
            {showPlaceholder && !isLoaded ? (
                <span className="absolute inset-0 animate-pulse bg-zinc-200/70" aria-hidden />
            ) : null}
            <Image
                {...props}
                src={imageSrc}
                alt={alt || ""}
                onLoad={(event) => {
                    setLoadedSource(imageSrc);
                    onLoad?.(event);
                }}
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
        </>
    );
}
