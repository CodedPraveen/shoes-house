import { products } from "@/data/catalog";

export const adminStats = {
  totalUsers: 1284,
  totalOrders: 342,
  totalRevenue: 2847500,
  totalProducts: products.length,
};

export const adminOrders = [
  {
    id: "ORD-1001",
    customer: "Arjun Mehta",
    email: "arjun@email.com",
    total: 12498,
    status: "delivered",
    createdAt: "2026-05-20",
  },
  {
    id: "ORD-1002",
    customer: "Sneha Rao",
    email: "sneha@email.com",
    total: 7299,
    status: "shipped",
    createdAt: "2026-05-22",
  },
  {
    id: "ORD-1003",
    customer: "Rohan Das",
    email: "rohan@email.com",
    total: 4999,
    status: "processing",
    createdAt: "2026-05-25",
  },
  {
    id: "ORD-1004",
    customer: "Priya Nair",
    email: "priya@email.com",
    total: 8999,
    status: "pending",
    createdAt: "2026-05-28",
  },
];

export const adminUsers = [
  {
    id: "usr_1",
    name: "Arjun Mehta",
    email: "arjun@email.com",
    orders: 4,
    joined: "2025-11-02",
  },
  {
    id: "usr_2",
    name: "Sneha Rao",
    email: "sneha@email.com",
    orders: 2,
    joined: "2026-01-15",
  },
  {
    id: "usr_3",
    name: "Rohan Das",
    email: "rohan@email.com",
    orders: 1,
    joined: "2026-03-08",
  },
];

export function getAdminProducts() {
  return products.map((p, index) => {
    const stock = p.stock ?? (index % 5 === 0 ? 3 : index % 7 === 0 ? 0 : 48);
    const status =
      stock === 0 ? "out_of_stock" : stock <= 5 ? "low_stock" : "in_stock";
    return { ...p, stock, status };
  });
}

export function getLowStockProducts() {
  return getAdminProducts().filter((p) => p.stock <= 5);
}
