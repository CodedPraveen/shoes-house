import { PrismaClient } from "@prisma/client";
import { products as catalogProducts } from "../data/catalog.js";

const prisma = new PrismaClient();

async function seedCategories() {
  const shoes = await prisma.category.upsert({
    where: { slug: "shoes" },
    update: {
      parentId: null,
      collection: "SHOES",
      deletedAt: null,
    },
    create: {
      name: "Shoes",
      slug: "shoes",
      collection: "SHOES",
      sortOrder: 1,
    },
  });

  const jewellery = await prisma.category.upsert({
    where: { slug: "jewellery" },
    update: {
      parentId: null,
      collection: "JEWELLERY",
      deletedAt: null,
    },
    create: {
      name: "Jewellery",
      slug: "jewellery",
      collection: "JEWELLERY",
      sortOrder: 2,
    },
  });

  const shoeSubs = [
    { name: "Footwear", slug: "footwear" },
    { name: "Men", slug: "men" },
    { name: "Women", slug: "women" },
    { name: "Boys", slug: "boys" },
    { name: "Sports", slug: "sports" },
    { name: "Casual", slug: "casual" },
  ];

  const jewellerySubs = [
    { name: "Necklaces", slug: "necklaces" },
    { name: "Earrings", slug: "earrings" },
    { name: "Rings", slug: "rings" },
    { name: "Bracelets", slug: "bracelets" },
    { name: "Mangalsutra", slug: "mangalsutra" },
    { name: "Bangles", slug: "bangles" },
    { name: "Anklets", slug: "anklets" },
    { name: "Pendants", slug: "pendants" },
  ];

  for (const [i, item] of shoeSubs.entries()) {
    await prisma.category.upsert({
      where: {
        slug: item.slug,
      },
      update: {
        parentId: shoes.id,
        collection: "SHOES",
        deletedAt: null,
      },
      create: {
        name: item.name,
        slug: item.slug,
        parentId: shoes.id,
        collection: "SHOES",
        sortOrder: i + 10,
      },
    });
  }

  for (const [i, item] of jewellerySubs.entries()) {
    await prisma.category.upsert({
      where: {
        slug: item.slug,
      },
      update: {
        parentId: jewellery.id,
        collection: "JEWELLERY",
        deletedAt: null,
      },
      create: {
        name: item.name,
        slug: item.slug,
        parentId: jewellery.id,
        collection: "JEWELLERY",
        sortOrder: i + 20,
      },
    });
  }
}

function buildImages(item) {
  const urls = item.images?.length ? [...item.images] : [];
  if (item.image && !urls.includes(item.image)) urls.unshift(item.image);
  if (item.hoverImage && !urls.includes(item.hoverImage))
    urls.push(item.hoverImage);

  return urls.map((url, index) => ({
    url,
    alt: item.name,
    sortOrder: index,
    isHover: url === item.hoverImage,
  }));
}

function buildVariants(item, baseStock) {
  const variants = [];
  let idx = 0;
  for (const color of item.colors || []) {
    for (const size of item.sizes || []) {
      const sku = `Shoes-House-${item.slug}-${color.id}-${size}`.toUpperCase();
      const stock =
        baseStock === 0 ? 0 : idx % 4 === 0 ? Math.min(3, baseStock) : 15;
      variants.push({
        sku,
        colorKey: color.id,
        size,
        stock,
      });
      idx++;
    }
  }
  return variants;
}

async function main() {

  await seedCategories();

  const categories = await prisma.category.findMany({
    where: {
      deletedAt: null,
    },
  });

  const categoryMap = {};

  for (const category of categories) {
    categoryMap[category.slug] = category.id;
  }

  for (const item of catalogProducts) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.warn(`Skip ${item.slug}: unknown category`);
      continue;
    }

    const index = catalogProducts.indexOf(item);
    const stock =
      item.stock ??
      (index % 5 === 0 ? 3 : index % 7 === 0 ? 0 : 48);

    const variantRows = buildVariants(item, stock);

    await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        brand: item.brand,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice ?? null,
        discount: item.discount ?? null,
        stock,
        isNew: item.isNew ?? false,
        isTrending: item.isTrending ?? false,
        purchaseCount: item.purchaseCount ?? 0,
        rank: item.rank ?? null,
        materials: item.materials ?? null,
        shippingInfo: item.shipping ?? null,
        returnPolicy: item.returnPolicy ?? null,
        tags: item.tags ?? [],
        categoryId,
        collection: "SHOES",
        deletedAt: null,
        images: { deleteMany: {}, create: buildImages(item) },
        colors: {
          deleteMany: {},
          create: (item.colors || []).map((c) => ({
            colorKey: c.id,
            label: c.label,
            hex: c.hex,
          })),
        },
        sizes: {
          deleteMany: {},
          create: (item.sizes || []).map((size) => ({ size })),
        },
        variants: {
          deleteMany: {},
          create: variantRows,
        },
      },
      create: {
        name: item.name,
        brand: item.brand,
        slug: item.slug,
        description: item.description,
        price: item.price,
        compareAtPrice: item.compareAtPrice ?? null,
        discount: item.discount ?? null,
        stock,
        isNew: item.isNew ?? false,
        isTrending: item.isTrending ?? false,
        purchaseCount: item.purchaseCount ?? 0,
        rank: item.rank ?? null,
        materials: item.materials ?? null,
        shippingInfo: item.shipping ?? null,
        returnPolicy: item.returnPolicy ?? null,
        tags: item.tags ?? [],
        categoryId,
        collection: "SHOES",
        images: { create: buildImages(item) },
        colors: {
          create: (item.colors || []).map((c) => ({
            colorKey: c.id,
            label: c.label,
            hex: c.hex,
          })),
        },
        sizes: {
          create: (item.sizes || []).map((size) => ({ size })),
        },
        variants: { create: variantRows },
      },
    });
  }

  const [products, variants] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.productVariant.count({ where: { deletedAt: null } }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
