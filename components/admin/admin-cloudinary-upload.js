"use client";

import { useRef, useState } from "react";
import { uploadProductImageAction } from "@/actions/admin-product-actions";
import LoadingButton from "@/components/ui/loading-button";

export default function AdminCloudinaryUpload({ imageUrls, onChange, cloudinaryConfig }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadProductImageAction(fd);
      if (!result.ok) {
        setError(result.error || "Upload failed");
        return;
      }
      onChange([...imageUrls, result.url]);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function openWidget() {
    if (typeof window === "undefined" || !window.cloudinary) {
      setError("Cloudinary widget not loaded");
      return;
    }
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!preset || !cloudinaryConfig?.cloudName) {
      setError("Set NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET and cloud name");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: preset,
        folder: cloudinaryConfig.folder || "aere/products",
        sources: ["local", "url", "camera"],
        multiple: true,
      },
      (err, result) => {
        if (err) {
          setError("Upload cancelled or failed");
          return;
        }
        if (result?.event === "success") {
          onChange([...imageUrls, result.info.secure_url]);
        }
      },
    );
    widget.open();
  }

  function removeUrl(url) {
    onChange(imageUrls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <LoadingButton
          type="button"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
          className="no54123-full border border-black/15 px-4 py-2 text-xs"
        >
          Upload image
        </LoadingButton>
        {cloudinaryConfig?.configured ? (
          <button
            type="button"
            onClick={openWidget}
            className="no54123-full border border-black/15 px-4 py-2 text-xs"
          >
            Cloudinary widget
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <ul className="flex flex-wrap gap-2">
        {imageUrls.map((url) => (
          <li key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="h-16 w-16 no54123-lg border border-black/10 object-cover"
            />
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="absolute -right-1 -top-1 no54123-full bg-black px-1.5 text-[10px] text-white"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
