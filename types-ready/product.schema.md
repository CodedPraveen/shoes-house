# Product Schema (TypeScript-ready)

Future `Product` type for Prisma / MongoDB:

```ts
type Product = {
  id: string;
  name: string;
  brand: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  hoverImage: string;
  colors: { id: string; label: string; hex: string }[];
  sizes: number[];
  category: "shoes" | "boys" | "men" | "footwear";
  categoryLabel: string;
  tags: string[];
  isNew: boolean;
  isTrending: boolean;
  purchaseCount: number;
  rank?: number;
  createdAt: string;
  materials: string;
  shipping: string;
  returnPolicy: string;
};
```

```ts
type CartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  color: string;
  size: number;
  quantity: number;
};
```
