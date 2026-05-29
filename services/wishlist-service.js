/** Future: sync with user account + database */

export const wishlistService = {
  async getByUserId() {
    return [];
  },

  async add() {
    throw new Error("Wishlist service not connected.");
  },
};
