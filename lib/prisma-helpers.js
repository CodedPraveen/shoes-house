/** Active (non–soft-deleted) records only */
export const notDeleted = {
  deletedAt: null,
};

export function withNotDeleted(where = {}) {
  return { ...where, deletedAt: null };
}
