/**
 * SEED-ONLY — used by prisma/seed.js to populate Supabase.
 * Storefront reads products via productService → Prisma.
 */

const img = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const cloudinaryImages = [
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548727/WhatsApp_Image_2026-08-07_at_11.01.54_AM.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786548890/WhatsApp_Image_2026-08-07_at_11.01.55_AM.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786549156/9b4f883c-b625-4369-889d-500e17a1b8fd.png",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550507/288e7ec9-070a-4bc9-b337-1b1789dc7c2b.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550529/8fc723d9-fbb1-4751-b82d-05dfbedddfb4.jpg",
  "https://res.cloudinary.com/rwuqhkyf/image/upload/f_auto/v1786550532/3ecff149-a5eb-4f8a-b6a3-05d92e300fb5.jpg",
];

export const products = [
  {
    id: "aero-one",
    name: "Aero One",
    brand: "Post Mart",
    slug: "aero-one",
    description:
      "A sculpted lifestyle runner with premium knit upper and cushioned midsole for all-day comfort.",
    price: 6499,
    compareAtPrice: 7999,
    discount: 19,
    image: cloudinaryImages[0],
    hoverImage: cloudinaryImages[1],
    images: [
      cloudinaryImages[0],
      cloudinaryImages[1],
      cloudinaryImages[2],
      cloudinaryImages[3],
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
    brand: "Post Mart",
    slug: "vertex-pro",
    description:
      "Performance-forward silhouette with responsive cushioning built for training and street wear.",
    price: 7299,
    compareAtPrice: 8999,
    discount: 19,
    image: cloudinaryImages[1],
    hoverImage: cloudinaryImages[2],
    images: [
      cloudinaryImages[1],
      cloudinaryImages[2],
      cloudinaryImages[3],
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
    brand: "Post Mart",
    slug: "drift-mono",
    description:
      "Minimal monochrome essential with clean lines and elevated street presence.",
    price: 4999,
    compareAtPrice: 5999,
    discount: 17,
    image: cloudinaryImages[2],
    hoverImage: cloudinaryImages[3],
    images: [
      cloudinaryImages[2],
      cloudinaryImages[3],
    ],
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
    brand: "Post Mart",
    slug: "pulse-knit",
    description:
      "Lightweight running profile with breathable knit and adaptive fit system.",
    price: 5899,
    image: cloudinaryImages[3],
    hoverImage: cloudinaryImages[4],
    images: [
      cloudinaryImages[3],
      cloudinaryImages[4],
    ],
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
    brand: "Post Mart",
    slug: "form-legacy",
    description:
      "Heritage court inspiration reimagined with modern proportions and luxury finishing.",
    price: 8999,
    compareAtPrice: 10999,
    discount: 18,
    image: cloudinaryImages[4],
    hoverImage: cloudinaryImages[5],
    images: [
      cloudinaryImages[4],
      cloudinaryImages[5],
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
    brand: "Post Mart",
    slug: "cloud-axis",
    description:
      "Everyday essential with cloud-soft cushioning and understated branding.",
    price: 4599,
    image: cloudinaryImages[5],
    hoverImage: cloudinaryImages[0],
    images: [
      cloudinaryImages[5],
      cloudinaryImages[0],
    ],
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
    brand: "Post Mart",
    slug: "junior-sprint",
    description:
      "Lightweight boys trainer with durable outsole and flexible forefoot.",
    price: 2999,
    image: cloudinaryImages[0],
    hoverImage: cloudinaryImages[1],
    images: [
      cloudinaryImages[0],
      cloudinaryImages[1],
    ],
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
    brand: "Post Mart",
    slug: "court-youth",
    description:
      "Classic court style scaled for younger athletes with premium comfort.",
    price: 3499,
    image: cloudinaryImages[1],
    hoverImage: cloudinaryImages[2],
    images: [
      cloudinaryImages[1],
      cloudinaryImages[2],
    ],
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
    brand: "Post Mart",
    slug: "studio-low",
    description:
      "Low-profile luxury sneaker with tonal paneling and refined silhouette.",
    price: 9499,
    image: cloudinaryImages[2],
    hoverImage: cloudinaryImages[3],
    images: [
      cloudinaryImages[2],
      cloudinaryImages[3],
    ],
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
    brand: "Post Mart",
    slug: "terra-glide",
    description:
      "Outdoor-inspired tread with urban refinement for versatile daily wear.",
    price: 5599,
    image: cloudinaryImages[3],
    hoverImage: cloudinaryImages[4],
    images: [
      cloudinaryImages[3],
      cloudinaryImages[4],
    ],
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
    brand: "Post Mart",
    slug: "essence-90",
    description:
      "Retro runner reborn with modern cushioning and archival design lines.",
    price: 1899,
    image: cloudinaryImages[4],
    hoverImage: cloudinaryImages[5],
    images: [
      cloudinaryImages[4],
      cloudinaryImages[5],
    ],
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
    brand: "Post Mart",
    slug: "night-runner",
    description:
      "Reflective details and bold profile for after-hours city movement.",
    price: 6799,
    image: cloudinaryImages[5],
    hoverImage: cloudinaryImages[0],
    images: [
      cloudinaryImages[5],
      cloudinaryImages[0],
    ],
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

// export const products = []; // Empty array for SEED-ONLY usage

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
