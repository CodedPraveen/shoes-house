import { prisma } from "@/lib/db";
import { productInclude } from "@/lib/product-include";
import { mapProducts } from "@/lib/mappers/product-mapper";

export const STOREFRONT_SECTION_DEFAULTS = Object.freeze([
  { key: "HERO", title: "Hero", subtitle: "Homepage campaign slides", sortOrder: 0 },
  { key: "FEATURED", title: "Curated for quiet luxury.", subtitle: "Featured Products", sortOrder: 10 },
  { key: "TRENDING", title: "Most wanted right now.", subtitle: null, sortOrder: 20 },
  { key: "LIFESTYLE", title: "Shop by lifestyle.", subtitle: null, sortOrder: 30 },
  { key: "NEW_ARRIVALS", title: "New Arrivals", subtitle: null, sortOrder: 40 },
]);

const LEGACY_PRODUCT_SECTION_KEYS = new Set(["FEATURED", "TRENDING", "NEW_ARRIVALS"]);

export const PRODUCT_SECTION_DEFAULTS = Object.freeze(
  STOREFRONT_SECTION_DEFAULTS.filter((section) => LEGACY_PRODUCT_SECTION_KEYS.has(section.key)),
);

export function isProductSectionKey(key) {
  return LEGACY_PRODUCT_SECTION_KEYS.has(key) || key.startsWith("PRODUCT_");
}

export function getProductSectionDefaults(collection) {
  const keys = collection === "JEWELLERY"
    ? new Set(["TRENDING", "NEW_ARRIVALS"])
    : new Set(["FEATURED", "TRENDING"]);
  return PRODUCT_SECTION_DEFAULTS.filter((section) => keys.has(section.key));
}

export function getHomepageProductSections(sections, collection) {
  const defaultKeys = new Set(getProductSectionDefaults(collection).map((section) => section.key));
  return sections
    .filter((section) => defaultKeys.has(section.key) || section.key.startsWith("PRODUCT_"))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function targetHref(item, collection) {
  if (item.targetType === "CATEGORY" && item.category?.slug && !item.category.deletedAt) return `/category/${item.category.slug}`;
  if (item.targetType === "PRODUCT" && item.product?.slug && !item.product.deletedAt) {
    return `/${item.product.collection === "JEWELLERY" ? "jewellery" : "shoes"}/product/${item.product.slug}`;
  }
  if (item.targetType === "CUSTOM" && item.customHref?.startsWith("/") && !item.customHref.startsWith("//")) return item.customHref;
  return collection === "JEWELLERY" ? "/jewellery" : "/shoes";
}

function mergeSections(rows) {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const defaults = STOREFRONT_SECTION_DEFAULTS.map((fallback) => ({
    ...fallback,
    enabled: true,
    items: [],
    ...byKey.get(fallback.key),
  }));
  const defaultKeys = new Set(STOREFRONT_SECTION_DEFAULTS.map((section) => section.key));
  const customRows = rows.filter((row) => !defaultKeys.has(row.key));
  return [...defaults, ...customRows].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getStorefrontConfig(collection) {
  const [sections, slides, navbarItems] = await Promise.all([
    prisma.storefrontSection.findMany({
      where: { collection },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          where: { enabled: true },
          orderBy: { sortOrder: "asc" },
          include: {
            category: { select: { id: true, name: true, slug: true, imageUrl: true, deletedAt: true } },
            product: { include: productInclude },
            mediaAsset: true,
          },
        },
      },
    }),
    prisma.heroSlide.findMany({
      where: { collection },
      orderBy: { sortOrder: "asc" },
      include: { mediaAsset: true, category: true, product: true },
    }),
    prisma.navbarItem.findMany({
      where: { collection, enabled: true },
      orderBy: { sortOrder: "asc" },
      include: { category: true, product: true },
    }),
  ]);

  return {
    sections: mergeSections(sections),
    slides: slides.filter((slide) => slide.enabled).map((slide) => ({ id: slide.id, image: slide.mediaAsset.url, alt: slide.alt || slide.mediaAsset.alt || "Post Mart campaign", href: targetHref(slide, collection) })),
    navbarItems: navbarItems.map((item) => ({ id: item.id, label: item.label, href: targetHref(item, collection) })),
  };
}

export async function getConfiguredProducts(section, fallback) {
  const selected = section?.items?.map((item) => item.product).filter(
    (product) => product && !product.deletedAt && product.processingStatus === "READY",
  ) ?? [];
  return selected.length ? mapProducts(selected, { includeInvalid: false }) : fallback;
}

export async function getStorefrontAdminData(collection) {
  const [config, categories, products, slides, navbarItems] = await Promise.all([
    getStorefrontConfig(collection),
    prisma.category.findMany({ where: { collection, deletedAt: null }, orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }], select: { id: true, name: true, slug: true } }),
    prisma.product.findMany({ where: { collection, deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 150, select: { id: true, name: true, slug: true } }),
    prisma.heroSlide.findMany({ where: { collection }, orderBy: { sortOrder: "asc" }, include: { mediaAsset: true, category: true, product: true } }),
    prisma.navbarItem.findMany({ where: { collection }, orderBy: { sortOrder: "asc" }, include: { category: true, product: true } }),
  ]);
  return {
    ...config,
    productSections: getHomepageProductSections(config.sections, collection),
    categories,
    products,
    slides,
    navbarItems,
  };
}

export async function getNavbarItems(collection) {
  const rows = await prisma.navbarItem.findMany({
    where: { collection },
    orderBy: { sortOrder: "asc" },
    include: { category: true, product: true },
  });
  if (!rows.length) return null;
  return rows.filter((item) => item.enabled).map((item) => ({ id: item.id, label: item.label, href: targetHref(item, collection) }));
}
