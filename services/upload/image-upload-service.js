/**
 * Image upload abstraction — swap provider without changing admin UI.
 * Future: Cloudinary | UploadThing
 */

export const imageUploadService = {
  provider: "local-stub",

  async upload(file, { folder = "products" } = {}) {
    return {
      ok: false,
      url: null,
      message: `Upload stub (${this.provider}). Connect Cloudinary or UploadThing.`,
      folder,
      fileName: file?.name,
    };
  },

  async uploadMany(files, options) {
    const results = await Promise.all(
      files.map((file) => this.upload(file, options)),
    );
    return results;
  },

  async delete(publicId) {
    return { ok: false, message: "Delete stub", publicId };
  },
};
