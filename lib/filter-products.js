import { PRICE_FILTERS } from "@/lib/constants";

export function matchesPriceRange(price, selectedPriceIds) {
  if (!selectedPriceIds?.length) return true;

  return selectedPriceIds.some((filterId) => {
    const range = PRICE_FILTERS.find((item) => item.id === filterId);
    if (!range) return false;
    return price >= range.min && price <= range.max;
  });
}

export function matchesSizes(productSizes, selectedSizes) {
  if (!selectedSizes?.length) return true;
  return selectedSizes.some((size) => productSizes.includes(Number(size)));
}

export function matchesColors(productColors, selectedColors) {
  if (!selectedColors?.length) return true;
  return selectedColors.some((color) =>
    productColors.some((item) => item.id === color),
  );
}

export function matchesQuery(product, query) {
  if (!query?.trim()) return true;
  const term = query.trim().toLowerCase();
  return (
    product.name.toLowerCase().includes(term) ||
    product.brand.toLowerCase().includes(term) ||
    product.categoryLabel?.toLowerCase().includes(term) ||
    product.description?.toLowerCase().includes(term)
  );
}

export function sortProducts(products, sortBy) {
  const list = [...products];

  switch (sortBy) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "latest":
    default:
      return list.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
  }
}

export function filterProducts(products, filters = {}) {
  const {
    query = "",
    priceRanges = [],
    sizes = [],
    colors = [],
    category = null,
  } = filters;

  return products.filter((product) => {
    if (category && product.category !== category) return false;
    if (!matchesQuery(product, query)) return false;
    if (!matchesPriceRange(product.price, priceRanges)) return false;
    if (!matchesSizes(product.sizes, sizes)) return false;
    if (!matchesColors(product.colors, colors)) return false;
    return true;
  });
}
