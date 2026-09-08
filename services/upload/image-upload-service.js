import {
  imageIdFromStagingUrl,
  removeStagedImage,
  stageImageFile,
} from "@/lib/image-storage";

export const imageUploadService = {
  provider: "filesystem",

  isConfigured() {
    return true;
  },

  async uploadFile(file) {
    try {
      return await stageImageFile(file);
    } catch (error) {
      return {
        ok: false,
        message: error?.message || "The image could not be staged.",
      };
    }
  },

  async uploadMany(files) {
    return Promise.all(Array.from(files || []).map((file) => this.uploadFile(file)));
  },

  async delete(reference) {
    const imageId = imageIdFromStagingUrl(reference) || String(reference || "");
    try {
      await removeStagedImage(imageId);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error?.message || "Staged image cleanup failed." };
    }
  },
};
