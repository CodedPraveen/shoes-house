/**
 * Client/server pagination helper — wire to DB offset/limit later.
 */
export function paginate(items, { page = 1, perPage = 12 } = {}) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  const data = items.slice(start, start + perPage);

  return {
    data,
    page: safePage,
    perPage,
    total,
    totalPages,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
