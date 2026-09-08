"use client";

import { useEffect, useRef, useState } from "react";
import {
  discardProductImageUploadsAction,
  uploadNewAdminProductImageAction,
  uploadProductImageAction,
} from "@/actions/admin-product-actions";
import LoadingButton from "@/components/ui/loading-button";
import SafeImage from "@/components/ui/safe-image";
import { isStagingProductImage } from "@/lib/product-image";

export default function AdminImageUpload({ imageUrls, onChange, uploadContext, onUploadingChange }) {
  const fileRef = useRef(null);
  const imageUrlsRef = useRef(imageUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);

  function setUploadState(value) {
    setUploading(value);
    onUploadingChange?.(value);
  }

  async function handleFile(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const remainingSlots = 8 - imageUrlsRef.current.length;
    if (remainingSlots <= 0) {
      setError("Maximum 8 product images are allowed.");
      event.target.value = "";
      return;
    }

    setError("");
    setUploadState(true);
    try {
      const results = await Promise.all(files.slice(0, remainingSlots).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        if (uploadContext) {
          formData.append("collection", uploadContext.collection);
          formData.append("categorySlug", uploadContext.categorySlug);
        }
        return uploadContext
          ? uploadNewAdminProductImageAction(formData)
          : uploadProductImageAction(formData);
      }));

      const successful = results.filter((result) => result?.ok && isStagingProductImage(result.url));
      const nextUrls = [
        ...imageUrlsRef.current,
        ...successful.map((result) => result.url),
      ].slice(0, 8);
      imageUrlsRef.current = nextUrls;
      onChange(nextUrls);

      const failed = results.length - successful.length;
      if (failed) setError(`${failed} image${failed === 1 ? "" : "s"} could not be staged.`);
      if (files.length > remainingSlots) setError(`Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"} can be added.`);
    } catch (uploadError) {
      setError(uploadError?.message || "One or more images could not be staged.");
    } finally {
      setUploadState(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeUrl(url) {
    const nextUrls = imageUrlsRef.current.filter((item) => item !== url);
    imageUrlsRef.current = nextUrls;
    onChange(nextUrls);
    if (isStagingProductImage(url)) await discardProductImageUploadsAction([url]);
  }

  return (
    <div className="space-y-3">
      <LoadingButton
        type="button"
        loading={uploading}
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
      {error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}
      <ul className="flex flex-wrap gap-2">
        {imageUrls.map((url) => (
          <li key={url} className="relative">
            <SafeImage
              width={64}
              height={64}
              src={url}
              alt=""
              unoptimized={isStagingProductImage(url)}
              className="h-16 w-16 rounded-lg border border-black/10 object-cover"
            />
            <button
              type="button"
              onClick={() => void removeUrl(url)}
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
