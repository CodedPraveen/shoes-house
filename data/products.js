import { products, getNewArrivals, getTrendingProducts } from "@/data/catalog";

export const navLinks = [
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Trending", href: "/trending" },
  { label: "Story", href: "/#story" },
  { label: "Categories", href: "/#categories" },
];

export const featuredCollection = [
  {
    id: "fc-1",
    title: "Sculpted Motion",
    description: "Lightweight luxury runners crafted for all-day movement.",
    image:
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fc-2",
    title: "Midnight Court",
    description: "Minimal silhouettes inspired by classic basketball icons.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
  },
];

export const trendingShoes = getTrendingProducts().slice(0, 6);

export const categories = [
  {
    id: "cat-men",
    title: "Men",
    href: "/category/men",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-boys",
    title: "Boys",
    href: "/category/boys",
    image:
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-sports",
    title: "Sports",
    href: "/category/shoes",
    image:
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "cat-lifestyle",
    title: "Lifestyle",
    href: "/category/footwear",
    image:
      "https://images.unsplash.com/photo-1519744346366-d1796261c3b1?auto=format&fit=crop&w=1200&q=80",
  },
];

export { products, getNewArrivals };
