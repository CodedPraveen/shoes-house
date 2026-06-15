/**
 * SEED-ONLY — used by prisma/seed.js to populate Supabase.
 * Storefront reads products via productService → Prisma.
 */

const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const products = [
  {
    id: "aero-one",
    name: "Aero One",
    brand: "Shoes House",
    slug: "aero-one",
    description:
      "A sculpted lifestyle runner with premium knit upper and cushioned midsole for all-day comfort.",
    price: 6499,
    compareAtPrice: 7999,
    discount: 19,
    image: img("1608231387042-66d1773070a5"),
    hoverImage: img("1560769629-975ec94e6a86"),
    images: [
      img("1608231387042-66d1773070a5"),
      img("1560769629-975ec94e6a86"),
      img("1542291026-7eec264c27ff"),
      img("1463100099107-aa0980c362e6"),
    ],
    colors: [
      { id: "black", label: "Black", hex: "#111111" },
      { id: "white", label: "White", hex: "#f5f5f5" },
      { id: "gray", label: "Gray", hex: "#9ca3af" },
    ],
    sizes: [38, 40, 42, 44],
    category: "shoes",
    categoryLabel: "Shoes",
    tags: ["lifestyle", "new"],
    isNew: true,
    isTrending: true,
    purchaseCount: 1240,
    rank: 1,
    createdAt: "2026-05-20",
    materials: "Premium knit upper, EVA foam midsole, rubber outsole.",
    shipping: "Free express shipping on orders above ₹2999.",
    returnPolicy: "30-day hassle-free returns on unworn pairs.",
  },
  {
    id: "vertex-pro",
    name: "Vertex Pro",
    brand: "Shoes House",
    slug: "vertex-pro",
    description:
      "Performance-forward silhouette with responsive cushioning built for training and street wear.",
    price: 7299,
    compareAtPrice: 8999,
    discount: 19,
    image: img("1549298916-b41d501d3772"),
    hoverImage: img("1491553895911-0055eca6402d"),
    images: [
      img("1549298916-b41d501d3772"),
      img("1491553895911-0055eca6402d"),
      img("1597045566677-8cf032ed6634"),
    ],
    colors: [
      { id: "black", label: "Black", hex: "#111111" },
      { id: "red", label: "Red", hex: "#c41e3a" },
      { id: "blue", label: "Blue", hex: "#1e3a8a" },
    ],
    sizes: [40, 42, 44],
    category: "men",
    categoryLabel: "Men",
    tags: ["sport", "trending"],
    isNew: true,
    isTrending: true,
    purchaseCount: 980,
    rank: 2,
    createdAt: "2026-05-18",
    materials: "Engineered mesh, TPU heel clip, dual-density sole.",
    shipping: "Delivered in 2-4 business days.",
    returnPolicy: "30-day returns with original packaging.",
  },
  {
    id: "drift-mono",
    name: "Drift Mono",
    brand: "Shoes House",
    slug: "drift-mono",
    description:
      "Minimal monochrome essential with clean lines and elevated street presence.",
    price: 4999,
    compareAtPrice: 5999,
    discount: 17,
    image: img("1600185365926-3a2ce3cdb9eb"),
    hoverImage: img("1465453869711-7e174808ace9"),
    images: [img("1600185365926-3a2ce3cdb9eb"), img("1465453869711-7e174808ace9")],
    colors: [
      { id: "white", label: "White", hex: "#f5f5f5" },
      { id: "black", label: "Black", hex: "#111111" },
    ],
    sizes: [36, 38, 40, 42],
    category: "footwear",
    categoryLabel: "Footwear",
    tags: ["minimal"],
    isNew: true,
    isTrending: false,
    purchaseCount: 640,
    createdAt: "2026-05-15",
    materials: "Smooth leather overlays, memory foam insole.",
    shipping: "Standard shipping 3-5 days.",
    returnPolicy: "Exchange within 15 days.",
  },
  {
    id: "pulse-knit",
    name: "Pulse Knit",
    brand: "Shoes House",
    slug: "pulse-knit",
    description:
      "Lightweight running profile with breathable knit and adaptive fit system.",
    price: 5899,
    image: img("1463100099107-aa0980c362e6"),
    hoverImage: img("1552346154-21d32810aba3"),
    images: [img("1463100099107-aa0980c362e6"), img("1552346154-21d32810aba3")],
    colors: [
      { id: "green", label: "Green", hex: "#166534" },
      { id: "black", label: "Black", hex: "#111111" },
    ],
    sizes: [38, 40, 42],
    category: "shoes",
    categoryLabel: "Shoes",
    tags: ["running"],
    isNew: false,
    isTrending: true,
    purchaseCount: 870,
    rank: 3,
    createdAt: "2026-05-10",
    materials: "Flyknit upper, carbon-infused plate.",
    shipping: "Free shipping nationwide.",
    returnPolicy: "30-day return window.",
  },
  {
    id: "form-legacy",
    name: "Form Legacy",
    brand: "Shoes House",
    slug: "form-legacy",
    description:
      "Heritage court inspiration reimagined with modern proportions and luxury finishing.",
    price: 8999,
    compareAtPrice: 10999,
    discount: 18,
    image: img("1515955656352-a1fa3ffcd111"),
    hoverImage: img("1612181346599-a6bfbd67be86"),
    images: [
      img("1515955656352-a1fa3ffcd111"),
      img("1612181346599-a6bfbd67be86"),
    ],
    colors: [
      { id: "brown", label: "Brown", hex: "#78350f" },
      { id: "white", label: "White", hex: "#f5f5f5" },
    ],
    sizes: [40, 42, 44],
    category: "men",
    categoryLabel: "Men",
    tags: ["premium"],
    isNew: false,
    isTrending: true,
    purchaseCount: 1120,
    createdAt: "2026-04-28",
    materials: "Full-grain leather, cupsole construction.",
    shipping: "Priority delivery available.",
    returnPolicy: "Premium returns within 30 days.",
  },
  {
    id: "cloud-axis",
    name: "Cloud Axis",
    brand: "Shoes House",
    slug: "cloud-axis",
    description:
      "Everyday essential with cloud-soft cushioning and understated branding.",
    price: 4599,
    image: img("1525966222134-fcfa99b8ae77"),
    hoverImage: img("1529810313688-44ea1c2d81d3"),
    images: [img("1525966222134-fcfa99b8ae77"), img("1529810313688-44ea1c2d81d3")],
    colors: [
      { id: "gray", label: "Gray", hex: "#9ca3af" },
      { id: "blue", label: "Blue", hex: "#1e3a8a" },
    ],
    sizes: [36, 38, 40],
    category: "footwear",
    categoryLabel: "Footwear",
    tags: ["everyday"],
    isNew: false,
    isTrending: true,
    purchaseCount: 520,
    createdAt: "2026-04-20",
    materials: "Recycled mesh, bio-based foam.",
    shipping: "Ships within 24 hours.",
    returnPolicy: "15-day exchange policy.",
  },
  {
    id: "junior-sprint",
    name: "Junior Sprint",
    brand: "Shoes House",
    slug: "junior-sprint",
    description:
      "Lightweight boys trainer with durable outsole and flexible forefoot.",
    price: 2999,
    image: img("1511556532299-8f662fc26c06"),
    hoverImage: img("1556906781-9a412961c28c"),
    images: [img("1511556532299-8f662fc26c06"), img("1556906781-9a412961c28c")],
    colors: [
      { id: "red", label: "Red", hex: "#c41e3a" },
      { id: "blue", label: "Blue", hex: "#1e3a8a" },
    ],
    sizes: [30, 32, 34, 36],
    category: "boys",
    categoryLabel: "Boys",
    tags: ["boys", "sport"],
    isNew: true,
    isTrending: false,
    purchaseCount: 310,
    createdAt: "2026-05-22",
    materials: "Reinforced toe cap, breathable mesh.",
    shipping: "Free shipping for kids collection.",
    returnPolicy: "30-day size exchange.",
  },
  {
    id: "court-youth",
    name: "Court Youth",
    brand: "Shoes House",
    slug: "court-youth",
    description:
      "Classic court style scaled for younger athletes with premium comfort.",
    price: 3499,
    image: img("1597045566677-8cf032ed6634"),
    hoverImage: img("1549298916-b41d501d3772"),
    images: [img("1597045566677-8cf032ed6634")],
    colors: [
      { id: "white", label: "White", hex: "#f5f5f5" },
      { id: "black", label: "Black", hex: "#111111" },
    ],
    sizes: [32, 34, 36, 38],
    category: "boys",
    categoryLabel: "Boys",
    tags: ["boys"],
    isNew: true,
    isTrending: true,
    purchaseCount: 450,
    createdAt: "2026-05-12",
    materials: "Synthetic leather, rubber cupsole.",
    shipping: "2-3 day delivery.",
    returnPolicy: "Easy returns within 20 days.",
  },
  {
    id: "studio-low",
    name: "Studio Low",
    brand: "Shoes House",
    slug: "studio-low",
    description:
      "Low-profile luxury sneaker with tonal paneling and refined silhouette.",
    price: 9499,
    image: img("1543163521-1bf539c55dd2"),
    hoverImage: img("1514989940723-e8e51635b782"),
    images: [img("1543163521-1bf539c55dd2"), img("1514989940723-e8e51635b782")],
    colors: [
      { id: "black", label: "Black", hex: "#111111" },
      { id: "brown", label: "Brown", hex: "#78350f" },
    ],
    sizes: [40, 42, 44],
    category: "men",
    categoryLabel: "Men",
    tags: ["luxury"],
    isNew: false,
    isTrending: true,
    purchaseCount: 760,
    createdAt: "2026-04-05",
    materials: "Italian nappa leather, suede accents.",
    shipping: "White-glove delivery in select cities.",
    returnPolicy: "30-day premium return.",
  },
  {
    id: "terra-glide",
    name: "Terra Glide",
    brand: "Shoes House",
    slug: "terra-glide",
    description:
      "Outdoor-inspired tread with urban refinement for versatile daily wear.",
    price: 5599,
    image: img("1605348532760-6753d2c43329"),
    hoverImage: img("1600185365926-3a2ce3cdb9eb"),
    images: [img("1605348532760-6753d2c43329")],
    colors: [
      { id: "green", label: "Green", hex: "#166534" },
      { id: "brown", label: "Brown", hex: "#78350f" },
    ],
    sizes: [38, 40, 42, 44],
    category: "footwear",
    categoryLabel: "Footwear",
    tags: ["outdoor"],
    isNew: false,
    isTrending: false,
    purchaseCount: 290,
    createdAt: "2026-03-18",
    materials: "Ripstop textile, trail-ready outsole.",
    shipping: "Standard 4-6 day shipping.",
    returnPolicy: "30-day returns.",
  },
  {
    id: "essence-90",
    name: "Essence 90",
    brand: "Shoes House",
    slug: "essence-90",
    description:
      "Retro runner reborn with modern cushioning and archival design lines.",
    price: 1899,
    image: img("1542291026-7eec264c27ff"),
    hoverImage: img("1608231387042-66d1773070a5"),
    images: [img("1542291026-7eec264c27ff")],
    colors: [
      { id: "white", label: "White", hex: "#f5f5f5" },
      { id: "red", label: "Red", hex: "#c41e3a" },
    ],
    sizes: [36, 38, 40],
    category: "shoes",
    categoryLabel: "Shoes",
    tags: ["value"],
    isNew: false,
    isTrending: false,
    purchaseCount: 890,
    createdAt: "2026-02-10",
    materials: "Synthetic suede, EVA midsole.",
    shipping: "Economy shipping available.",
    returnPolicy: "15-day returns.",
  },
  {
    id: "night-runner",
    name: "Night Runner",
    brand: "Shoes House",
    slug: "night-runner",
    description:
      "Reflective details and bold profile for after-hours city movement.",
    price: 6799,
    image: img("1552346154-21d32810aba3"),
    hoverImage: img("1463100099107-aa0980c362e6"),
    images: [img("1552346154-21d32810aba3")],
    colors: [
      { id: "black", label: "Black", hex: "#111111" },
      { id: "gray", label: "Gray", hex: "#9ca3af" },
    ],
    sizes: [40, 42, 44],
    category: "shoes",
    categoryLabel: "Shoes",
    tags: ["limited"],
    isNew: true,
    isTrending: true,
    purchaseCount: 670,
    createdAt: "2026-05-25",
    materials: "Reflective yarn, nitrogen-infused foam.",
    shipping: "Express 1-2 day shipping.",
    returnPolicy: "30-day returns.",
  },
];
export function getProductById(id) {
  return products.find((p) => p.id === id) ?? null;
}

export function getProductsByCategory(category) {
  return products.filter((p) => p.category === category);
}

export function getNewArrivals() {
  return products
    .filter((p) => p.isNew)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getTrendingProducts() {
  return products
    .filter((p) => p.isTrending)
    .sort((a, b) => b.purchaseCount - a.purchaseCount);
}

export function getBestSellers(limit = 6) {
  return [...products]
    .sort((a, b) => b.purchaseCount - a.purchaseCount)
    .slice(0, limit);
}

export function getRelatedProducts(productId, limit = 4) {
  const current = getProductById(productId);
  if (!current) return [];

  return products
    .filter(
      (p) =>
        p.id !== productId &&
        (p.category === current.category ||
          p.tags.some((t) => current.tags.includes(t))),
    )
    .slice(0, limit);
}
