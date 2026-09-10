"use client";

import { useEffect, useRef, useState } from "react";
import LoadingButton from "@/components/ui/loading-button";
import SafeImage from "@/components/ui/safe-image";

const MAX_PRODUCT_IMAGES = 8;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png"]);

export default function AdminImageUpload({
  images,
  onChange,
}) {
  const fileRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      for (const image of images) {
        if (image?.type === "new" && image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      }
    };
  }, []);

  function handleFile(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");

    const remainingSlots = MAX_PRODUCT_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setError("Maximum 8 product images are allowed.");
      event.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    const nextImages = [...images];
    const rejected = [];

    for (const file of selectedFiles) {
      if (!SUPPORTED_TYPES.has(file.type)) {
        rejected.push(`${file.name}: only JPG and PNG images are supported.`);
        continue;
      }

      if (file.size <= 0) {
        rejected.push(`${file.name}: the file is empty.`);
        continue;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        rejected.push(`${file.name}: maximum size is 10 MB.`);
        continue;
      }

      const preview = URL.createObjectURL(file);

      nextImages.push({
        type: "new",
        file,
        preview,
      });
    }

    onChange(nextImages);

    if (files.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else if (rejected.length) {
      setError(rejected.join(" "));
    }

    event.target.value = "";
  }

  function removeImage(index) {
    const image = images[index];

    if (image?.type === "new" && image.preview) {
      URL.revokeObjectURL(image.preview);
    }

    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);

    onChange(nextImages);
    setError("");
  }

  return (
    <div className="space-y-3">
      <LoadingButton
        type="button"
        onClick={() => fileRef.current?.click()}
        className="rounded-xl border border-black/15 px-4 py-2 text-xs"
      >
        Upload JPG/PNG
      </LoadingButton>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
        multiple
      />

      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="flex flex-wrap gap-2">
        {images.map((image, index) => (
          <li key={image.type === "new" ? image.preview : image.url} className="relative">
            {image.type === "new" ? (
              <img
                src={image.preview}
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border border-black/10 object-cover"
              />
            ) : (
              <SafeImage
                width={64}
                height={64}
                src={image.url}
                alt=""
                className="h-16 w-16 rounded-lg border border-black/10 object-cover"
              />
            )}

            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -right-1 -top-1 rounded-full bg-black px-1.5 text-[10px] text-white"
              aria-label="Remove image"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}