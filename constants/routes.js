/** Route access configuration for middleware and navigation */

export const PUBLIC_ROUTES = [
  "/",
  "/new-arrivals",
  "/trending",
  "/products",
  "/search",
  "/category/shoes",
  "/category/boys",
  "/category/men",
  "/category/footwear",
  "/contact",
  "/shipping",
  "/return",
  "/faq",
  "/about",
  "/journal",
  "/careers",
  "/stores",
  "/sign-in",
  "/sign-up",
];

export const PROTECTED_ROUTES = [
  "/profile",
  "/cart",
  "/checkout",
  "/orders",
  "/wishlist",
];

export const ADMIN_ROUTES = ["/admin"];

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "All Shoes", href: "/products" },
    { label: "Trending", href: "/trending" },
    { label: "Categories", href: "/#categories" },
  ],
  support: [
    { label: "Contact", href: "/contact" },
    { label: "Shipping", href: "/shipping" },
    { label: "Return Policy", href: "/return" },
    { label: "FAQ", href: "/faq" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Careers", href: "/careers" },
    { label: "Stores", href: "/stores" },
  ],
};
