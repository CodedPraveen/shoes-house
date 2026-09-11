"use client";

import Image from "next/image";
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
  const previewUrlsRef = useRef(new Set());
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [reorderMessage, setReorderMessage] = useState("");

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      for (const preview of previewUrls) {
        URL.revokeObjectURL(preview);
      }

      previewUrls.clear();
    };
  }, []);

  function moveImage(fromIndex, toIndex) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= images.length ||
      toIndex >= images.length
    ) {
      return;
    }

    const nextImages = [...images];
    const [movedImage] = nextImages.splice(fromIndex, 1);

    nextImages.splice(toIndex, 0, movedImage);
    onChange(nextImages);
    setError("");
    setReorderMessage(
      `Image moved from position ${fromIndex + 1} to position ${toIndex + 1}.`,
    );
  }

  function handleDragStart(event, index) {
    setDraggedIndex(index);
    setDropIndex(index);
    setReorderMessage("");

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragOver(event, index) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dropIndex !== index) {
      setDropIndex(index);
    }
  }

  function handleDrop(event, index) {
    event.preventDefault();

    const transferredIndex =
      event.dataTransfer.getData("text/plain");
    const sourceIndex = transferredIndex === ""
      ? draggedIndex
      : Number(transferredIndex);

    if (Number.isInteger(sourceIndex)) {
      moveImage(sourceIndex, index);
    }

    setDraggedIndex(null);
    setDropIndex(null);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDropIndex(null);
  }

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
      previewUrlsRef.current.add(preview);

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
      previewUrlsRef.current.delete(image.preview);
    }

    const nextImages = images.filter((_, imageIndex) => imageIndex !== index);

    onChange(nextImages);
    setError("");
    setReorderMessage(
      `Image removed. ${nextImages.length} image${nextImages.length === 1 ? " remains" : "s remain"}.`,
    );
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

      <p className="sr-only" aria-live="polite">
        {reorderMessage}
      </p>

      {images.length > 1 ? (
        <p className="text-xs text-slate-500">
          Drag the handle to reorder, or use the arrow buttons on touch and keyboard devices.
        </p>
      ) : null}

      <ul className="flex flex-wrap gap-3" aria-label="Product image order">
        {images.map((image, index) => (
          <li
            key={image.type === "new" ? image.preview : image.url}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={(event) => handleDrop(event, index)}
            className={`relative w-28 rounded-xl border bg-white p-2 transition ${
              draggedIndex === index
                ? "scale-95 border-slate-400 opacity-60"
                : dropIndex === index
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-slate-200"
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-semibold text-white">
                {index + 1}
              </span>

              <button
                type="button"
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragEnd={handleDragEnd}
                className="cursor-grab rounded-md px-2 py-1 text-sm leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:cursor-grabbing"
                aria-label={`Drag image ${index + 1} to reorder`}
                title="Drag to reorder"
              >
                ⋮⋮
              </button>
            </div>

            <div className="relative">
              {image.type === "new" ? (
                <Image
                  src={image.preview}
                  alt={`Product image ${index + 1}`}
                  width={96}
                  height={96}
                  className="h-24 w-full rounded-lg border border-black/10 object-cover"
                />
              ) : (
                <SafeImage
                  width={96}
                  height={96}
                  src={image.url}
                  alt={`Product image ${index + 1}`}
                  className="h-24 w-full rounded-lg border border-black/10 object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-black px-1.5 text-[10px] text-white"
                aria-label={`Remove image ${index + 1}`}
              >
                ×
              </button>
            </div>

            <div className="mt-2 min-h-5 text-center text-[10px] font-semibold tracking-wide text-slate-600">
              {index === 0 ? "PRIMARY" : index === 1 ? "HOVER" : null}
            </div>

            {index > 0 ? (
              <button
                type="button"
                onClick={() => moveImage(index, 0)}
                className="mt-1 w-full rounded-md border border-slate-200 px-1.5 py-1 text-[10px] font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900"
                aria-label={`Set image ${index + 1} as primary`}
              >
                Set as primary
              </button>
            ) : null}

            <div className="mt-2 grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => moveImage(index, index - 1)}
                disabled={index === 0}
                className="rounded-md border border-slate-200 px-1 py-1 text-xs text-slate-600 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Move image ${index + 1} left`}
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => moveImage(index, index + 1)}
                disabled={index === images.length - 1}
                className="rounded-md border border-slate-200 px-1 py-1 text-xs text-slate-600 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label={`Move image ${index + 1} right`}
              >
                →
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
