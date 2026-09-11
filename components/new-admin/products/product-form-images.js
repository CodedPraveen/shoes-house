"use client";

import AdminImageUpload from "@/components/admin/admin-image-upload";

const MAX_PRODUCT_IMAGES = 8;

export default function ProductFormImages({
    images,
    onChange,
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                    Product images{" "}
                    <span className="text-rose-600" aria-hidden="true">
                        *
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    {images.length} / {MAX_PRODUCT_IMAGES}
                </span>
            </div>

            <AdminImageUpload
                images={images}
                onChange={onChange}
            />

            <p className="mt-2 text-xs text-slate-500">
                Select up to {MAX_PRODUCT_IMAGES} images from
                your device. JPG and PNG files are converted to
                WebP without resizing after the product is
                created.
            </p>

            <p className="mt-1 text-xs text-slate-500">
                Images are uploaded to the server only when you
                create or save the product.
            </p>
        </div>
    );
}