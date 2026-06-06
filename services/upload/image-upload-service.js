import { v2 as cloudinary } from "cloudinary";

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function getCloudinary() {
  if (!isConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export const imageUploadService = {
  provider: "cloudinary",

  isConfigured,

  getUploadWidgetConfig() {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        process.env.CLOUDINARY_CLOUD_NAME,
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "aere/products",
    };
  },

  async uploadBuffer(buffer, { folder = "aere/products", fileName = "upload" } = {}) {
    const cld = getCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        {
          folder,
          public_id: `${Date.now()}-${fileName.replace(/\.[^.]+$/, "")}`,
          resource_type: "image",
        },
        (err, result) => {
          if (err) reject(err);
          else
            resolve({
              ok: true,
              url: result.secure_url,
              publicId: result.public_id,
            });
        },
      );
      stream.end(buffer);
    });
  },

  async uploadFile(file, options = {}) {
    if (!file) {
      return { ok: false, message: "No file provided" };
    }

    if (!isConfigured()) {
      return {
        ok: false,
        message: "Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await this.uploadBuffer(buffer, {
      folder: options.folder,
      fileName: file.name || "upload",
    });
    return result;
  },

  async uploadMany(files, options) {
    const list = Array.from(files || []);
    return Promise.all(list.map((file) => this.uploadFile(file, options)));
  },

  async delete(publicId) {
    if (!isConfigured() || !publicId) {
      return { ok: false, message: "Cloudinary not configured or missing publicId" };
    }
    const cld = getCloudinary();
    await cld.uploader.destroy(publicId);
    return { ok: true };
  },
};
