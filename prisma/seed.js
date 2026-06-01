import { PrismaClient } from "@prisma/client";
import { products as catalogProducts } from "../data/catalog.js";

const prisma = new PrismaClient();

const categoryDefs = [
  {
    slug: "shoes",
    name: "Shoes",
    imageUrl:
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 1,
  },
  {
    slug: "boys",
    name: "Boys",
    imageUrl:
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 2,
  },
  {
    slug: "men",
    name: "Men",
    imageUrl:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 3,
  },
  {
    slug: "footwear",
    name: "Footwear",
    imageUrl:
      "https://images.unsplash.com/photo-1519744346366-d1796261c3b1?auto=format&fit=crop&w=1200&q=80",
    sortOrder: 4,
  },
];

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
      const sku = `AERE-${item.slug}-${color.id}-${size}`.toUpperCase();
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
  console.log("Seeding AERÉ database...");

  const categoryMap = {};

  for (const cat of categoryDefs) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        deletedAt: null,
      },
      create: cat,
    });
    categoryMap[cat.slug] = row.id;
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
  console.log(`Done. ${products} products, ${variants} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
