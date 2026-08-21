"use client";

import { useEffect, useRef, useState } from "react";
import { uploadNewAdminProductImageAction, uploadProductImageAction } from "@/actions/admin-product-actions";
import LoadingButton from "@/components/ui/loading-button";
import SafeImage from "@/components/ui/safe-image";
import { validateProductImageUrl } from "@/lib/product-image";

export default function AdminCloudinaryUpload({ imageUrls, onChange, cloudinaryConfig, uploadContext, onUploadingChange }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageUrlsRef = useRef(imageUrls);

  useEffect(() => {
    imageUrlsRef.current = imageUrls;
  }, [imageUrls]);

  function setUploadState(value) {
    setUploading(value);
    onUploadingChange?.(value);
  }

  function appendCloudinaryUrl(url) {
    const validation = validateProductImageUrl(url);

    if (!validation.isValid) {
      setError(
        validation.reason ||
        "Cloudinary returned an invalid image URL",
      );
      return false;
    }

    const currentUrls = imageUrlsRef.current;

    if (currentUrls.length >= 8) {
      setError("Maximum 8 product images are allowed.");
      return false;
    }

    if (currentUrls.includes(validation.url)) {
      return true;
    }

    const nextUrls = [
      ...currentUrls,
      validation.url,
    ];

    imageUrlsRef.current = nextUrls;
    onChange(nextUrls);

    return true;
  }

  async function handleFile(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setError("");

    const remainingSlots = 8 - imageUrls.length;

    if (remainingSlots <= 0) {
      setError("Maximum 8 product images are allowed.");
      e.target.value = "";
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(
        `Only ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"
        } can be added. Maximum is 8.`,
      );
    }

    setUploadState(true);

    try {
      const uploadResults = await Promise.all(
        selectedFiles.map(async (file) => {
          const fd = new FormData();

          fd.append("file", file);

          if (uploadContext) {
            fd.append(
              "collection",
              uploadContext.collection,
            );

            fd.append(
              "categorySlug",
              uploadContext.categorySlug,
            );
          }

          const result = uploadContext
            ? await uploadNewAdminProductImageAction(fd)
            : await uploadProductImageAction(fd);

          return result;
        }),
      );

      const successfulUrls = uploadResults
        .filter((result) => result?.ok && result?.url)
        .map((result) => {
          const validation = validateProductImageUrl(
            result.url,
          );

          return validation.isValid
            ? validation.url
            : null;
        })
        .filter(Boolean);

      const failedUploads = uploadResults.filter(
        (result) => !result?.ok,
      );

      if (successfulUrls.length) {
        const currentUrls = imageUrlsRef.current;

        const nextUrls = [
          ...currentUrls,
          ...successfulUrls,
        ].slice(0, 8);

        imageUrlsRef.current = nextUrls;
        onChange(nextUrls);
      }

      if (failedUploads.length) {
        setError(
          `${failedUploads.length} image${failedUploads.length === 1 ? "" : "s"
          } failed to upload.`,
        );
      }
    } catch (err) {
      console.error(
        "[admin-cloudinary-upload] multiple upload failed:",
        err,
      );

      setError(
        err?.message || "One or more images failed to upload.",
      );
    } finally {
      setUploadState(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
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
        folder: cloudinaryConfig.folder || "postmart/products",
        sources: ["url", "local"],
        multiple: true,
      },
      (err, result) => {
        if (err) {
          setError("Upload cancelled or failed");
          setUploadState(false);
          return;
        }
        if (result?.event === "success") {
          appendCloudinaryUrl(result.info.secure_url);
        }
        if (["abort", "close", "queues-end"].includes(result?.event)) {
          setUploadState(false);
        }
      },
    );
    setUploadState(true);
    widget.open();
  }

  function removeUrl(url) {
    const nextUrls = imageUrlsRef.current.filter(
      (u) => u !== url,
    );

    imageUrlsRef.current = nextUrls;
    onChange(nextUrls);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* <LoadingButton
          type="button"
          loading={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-xl border border-black/15 px-4 py-2 text-xs"
        >
          Upload image
        </LoadingButton> */}
        {cloudinaryConfig?.configured ? (
          <LoadingButton
            type="button"
            onClick={openWidget}
            loading={uploading}
            className="rounded-xl border border-black/15 px-4 py-2 text-xs"
          >
            Cloudinary widget
          </LoadingButton>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          multiple={true}
        />
      </div>
      {error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}
      <ul className="flex flex-wrap gap-2">
        {imageUrls.map((url) => (
          <li key={url} className="relative">
            <SafeImage
              width={64}
              height={64}
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
