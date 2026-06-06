/** Admin mock data — orders/users/stats until Phase 4+ (Prisma orders/users) */

export const adminStats = {
  totalUsers: 1284,
  totalOrders: 342,
  totalRevenue: 2847500,
};

export const adminOrders = [
  {
    id: "ORD-1001",
    customer: "Arjun Mehta",
    email: "arjun@email.com",
    total: 12498,
    status: "DELIVERED",
    createdAt: "2026-05-20",
  },
  {
    id: "ORD-1002",
    customer: "Sneha Rao",
    email: "sneha@email.com",
    total: 7299,
    status: "SHIPPED",
    createdAt: "2026-05-22",
  },
  {
    id: "ORD-1003",
    customer: "Rohan Das",
    email: "rohan@email.com",
    total: 4999,
    status: "PROCESSING",
    createdAt: "2026-05-25",
  },
  {
    id: "ORD-1004",
    customer: "Priya Nair",
    email: "priya@email.com",
    total: 8999,
    status: "PENDING",
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
