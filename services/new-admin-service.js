import { prisma } from "@/lib/db";
import { isCodMethod, isRealizedOrder, serializeOrder } from "@/lib/new-admin/order-utils";
import { validateProductImages } from "@/lib/product-image";

const COD_PAYMENT_MATCH = {
  OR: [
    { paymentMethod: { contains: "Cash on Delivery", mode: "insensitive" } },
    { paymentMethod: { equals: "COD", mode: "insensitive" } },
  ],
};

const COD_ORDER_MATCH = {
  payments: { some: { deletedAt: null, ...COD_PAYMENT_MATCH } },
};

const ONLINE_PAID_MATCH = {
  payments: {
    some: {
      deletedAt: null,
      status: "PAID",
      NOT: COD_PAYMENT_MATCH,
    },
  },
};

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date, amount) {
  const value = new Date(date);
  value.setDate(value.getDate() + amount);
  return value;
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function resolveDateRange(params = {}) {
  const today = startOfDay();
  const preset = params.date ?? "all";

  if (preset === "today") return { gte: today, lt: addDays(today, 1) };
  if (preset === "yesterday") return { gte: addDays(today, -1), lt: today };
  if (preset === "7d") return { gte: addDays(today, -6), lt: addDays(today, 1) };
  if (preset === "30d") return { gte: addDays(today, -29), lt: addDays(today, 1) };
  if (preset === "month") {
    return { gte: new Date(today.getFullYear(), today.getMonth(), 1), lt: addDays(today, 1) };
  }
  if (preset === "custom") {
    const from = validDate(params.from);
    const to = validDate(params.to);
    if (from || to) return { ...(from ? { gte: from } : {}), ...(to ? { lt: addDays(to, 1) } : {}) };
  }
  return null;
}

function workflowWhere(workflow) {
  switch (workflow) {
    case "new":
    case "confirm":
      return { status: "PENDING", confirmedByCall: false };
    case "confirmed":
      return { status: "CONFIRMED" };
    case "processing":
      return { status: "PROCESSING" };
    case "ready_to_send":
      return { status: "READY_TO_SEND", trackingNumber: null };
    case "sending":
      return { status: "SHIPPED" };
    case "in_transit":
      return { trackingStatus: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] } };
    case "delivered":
      return { status: "DELIVERED" };
    case "cancelled":
      return { status: "CANCELLED" };
    case "paid":
      return ONLINE_PAID_MATCH;
    case "cod":
      return COD_ORDER_MATCH;
    case "cod_outstanding":
      return { ...COD_ORDER_MATCH, status: { notIn: ["DELIVERED", "CANCELLED"] } };
    case "payment_issue":
      return {
        payments: {
          some: { deletedAt: null, status: { in: ["PENDING", "FAILED"] }, NOT: COD_PAYMENT_MATCH },
        },
      };
    case "delivered_today":
      return { status: "DELIVERED", deliveredAt: { gte: startOfDay(), lt: addDays(startOfDay(), 1) } };
    default:
      return {};
  }
}

export function buildOrderWhere(params = {}) {
  const dateRange = resolveDateRange(params);
  const query = String(params.q ?? "").trim();
  const filters = [
    { deletedAt: null },
    workflowWhere(params.workflow),
  ];

  if (dateRange) filters.push({ createdAt: dateRange });
  if (query) {
    filters.push({
      OR: [
        { orderNumber: { contains: query, mode: "insensitive" } },
        { shipFullName: { contains: query, mode: "insensitive" } },
        { shipPhone: { contains: query } },
        { trackingNumber: { contains: query, mode: "insensitive" } },
      ],
    });
  }
  return { AND: filters };
}

async function aggregateTotal(where) {
  const result = await prisma.order.aggregate({ where, _sum: { total: true } });
  return result._sum.total ?? 0;
}

async function getTodayRealizedRevenue() {
  const range = { gte: startOfDay(), lt: addDays(startOfDay(), 1) };
  const [onlinePayments, deliveredCod] = await Promise.all([
    prisma.payment.findMany({
      where: {
        deletedAt: null,
        status: "PAID",
        createdAt: range,
        NOT: COD_PAYMENT_MATCH,
        order: { deletedAt: null, status: { not: "CANCELLED" } },
      },
      select: { orderId: true, order: { select: { total: true } } },
    }),
    prisma.order.aggregate({
      where: { deletedAt: null, status: "DELIVERED", deliveredAt: range, ...COD_ORDER_MATCH },
      _sum: { total: true },
    }),
  ]);
  const onlineRevenue = [...new Map(onlinePayments.map((payment) => [payment.orderId, payment.order.total])).values()]
    .reduce((sum, total) => sum + total, 0);
  return onlineRevenue + (deliveredCod._sum.total ?? 0);
}

export async function getOrderKpis(params = {}) {
  const dateRange = resolveDateRange(params);
  const base = { deletedAt: null, ...(dateRange ? { createdAt: dateRange } : {}) };
  const notCancelled = { ...base, status: { not: "CANCELLED" } };
  const codOutstandingWhere = { ...base, ...COD_ORDER_MATCH, status: { notIn: ["DELIVERED", "CANCELLED"] } };
  const codDeliveredWhere = { ...base, ...COD_ORDER_MATCH, status: "DELIVERED" };
  const paidWhere = { ...notCancelled, ...ONLINE_PAID_MATCH };

  const [totalOrders, deliveredOrders, paidOrders, codOutstanding, paidRevenue, codRevenue, codDeliveredRevenue] =
    await Promise.all([
      prisma.order.count({ where: base }),
      prisma.order.count({ where: { ...base, status: "DELIVERED" } }),
      prisma.order.count({ where: paidWhere }),
      prisma.order.count({ where: codOutstandingWhere }),
      aggregateTotal(paidWhere),
      aggregateTotal({ ...notCancelled, ...COD_ORDER_MATCH }),
      aggregateTotal(codDeliveredWhere),
    ]);

  return {
    totalOrders,
    deliveredOrders,
    paidOrders,
    codOutstanding,
    totalRevenue: paidRevenue + codDeliveredRevenue,
    paidRevenue,
    codRevenue,
    codDeliveredRevenue,
  };
}

export async function getAttentionCounts() {
  const staleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const base = { deletedAt: null };

  const [
    waitingConfirmation,
    processing,
    missingTracking,
    inTransit,
    staleTracking,
    codOutstanding,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        ...base,
        status: "PENDING",
        confirmedByCall: false,
      },
    }),

    prisma.order.count({
      where: {
        ...base,
        status: "PROCESSING",
      },
    }),

    prisma.order.count({
      where: {
        ...base,
        status: "READY_TO_SEND",
        trackingNumber: null,
      },
    }),

    prisma.order.count({
      where: {
        ...base,
        trackingStatus: {
          in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"],
        },
      },
    }),

    prisma.order.count({
      where: {
        ...base,
        status: "SHIPPED",
        trackingNumber: {
          not: null,
        },
        OR: [
          {
            lastTrackingSync: null,
          },
          {
            lastTrackingSync: {
              lt: staleBefore,
            },
          },
        ],
      },
    }),

    prisma.order.count({
      where: {
        ...base,
        ...COD_ORDER_MATCH,
        status: {
          notIn: ["DELIVERED", "CANCELLED"],
        },
      },
    }),
  ]);

  return {
    waitingConfirmation,
    processing,
    missingTracking,
    inTransit,
    staleTracking,
    codOutstanding,
  };
}

export async function getOrdersPage(params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 20;
  const where = buildOrderWhere(params);
  const [rows, total, kpis, attention] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payments: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        items: { where: { deletedAt: null }, take: 3, select: { id: true, productName: true, quantity: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
    getOrderKpis(params),
    getAttentionCounts(),
  ]);
  return { orders: rows.map(serializeOrder), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)), kpis, attention };
}

export async function getOrderDetail(id) {
  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: true,
      items: { where: { deletedAt: null }, include: { product: { select: { slug: true } } } },
      payments: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      checkpoints: { orderBy: { checkpointTime: "desc" } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  return order ? serializeOrder(order) : null;
}

export async function getOrdersForExport(params = {}) {
  const rows = await prisma.order.findMany({
    where: buildOrderWhere(params),
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: { payments: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return rows.map(serializeOrder);
}

export async function getDashboardData() {
  const todayRange = { date: "today" };
  const [kpis, todayKpis, todayRevenue, productCount, customerCount, lowStockCount, recentOrders, topProducts, lowStock, attention] =
    await Promise.all([
      getOrderKpis(),
      getOrderKpis(todayRange),
      getTodayRealizedRevenue(),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, role: "customer" } }),
      prisma.productVariant.count({ where: { deletedAt: null, isActive: true, stock: { lte: 5 } } }),
      prisma.order.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { payments: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { items: true } } },
      }),
      prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { purchaseCount: "desc" },
        take: 5,
        select: { id: true, name: true, purchaseCount: true, stock: true, slug: true },
      }),
      prisma.productVariant.findMany({
        where: { deletedAt: null, isActive: true, stock: { lte: 5 } },
        orderBy: { stock: "asc" },
        take: 6,
        include: { product: { select: { id: true, name: true } } },
      }),
      getAttentionCounts(),
    ]);
  return {
    kpis,
    todayKpis,
    todayRevenue,
    productCount,
    customerCount,
    lowStockCount,
    recentOrders: recentOrders.map(serializeOrder),
    topProducts,
    lowStock,
    attention,
  };
}

export async function getProductsPage(params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 20;
  const query = String(params.q ?? "").trim();
  const stock = params.stock;
  const where = {
    deletedAt: null,
    ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { brand: { contains: query, mode: "insensitive" } }, { slug: { contains: query, mode: "insensitive" } }] } : {}),
    ...(params.collection ? { collection: params.collection } : {}),
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(stock === "out" ? { stock: 0 } : stock === "low" ? { stock: { gt: 0, lte: 5 } } : stock === "in" ? { stock: { gt: 5 } } : {}),
  };
  const [products, total, categories, imageCandidates] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true, slug: true } }, images: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }, _count: { select: { variants: true } } },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { deletedAt: null, parentId: { not: null } }, orderBy: { name: "asc" }, select: { name: true, slug: true, collection: true } }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        processingStatus: true,
        processingError: true,
        images: {
          where: { deletedAt: null },
          orderBy: { sortOrder: "asc" },
          select: { url: true },
        },
      },
    }),
  ]);
  const validatedProducts = products.map((product) => ({
    ...product,
    imageValidation: validateProductImages(product.images),
  }));
  const failedProducts = imageCandidates
    .map((product) => ({
      ...product,
      imageValidation: validateProductImages(product.images),
    }))
    .filter((product) => (
      product.processingStatus === "FAILED" ||
      (product.processingStatus === "READY" && !product.imageValidation.isValid)
    ));
  return {
    products: validatedProducts,
    failedProducts,
    categories,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getInventoryPage(params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 20;
  const query = String(params.q ?? "").trim();
  const where = {
    deletedAt: null,
    isActive: true,
    ...(query ? { OR: [{ sku: { contains: query, mode: "insensitive" } }, { product: { name: { contains: query, mode: "insensitive" } } }] } : {}),
    ...(params.stock === "out" ? { stock: 0 } : params.stock === "low" ? { stock: { gt: 0, lte: 5 } } : params.stock === "in" ? { stock: { gt: 5 } } : {}),
  };
  const [variants, total, outOfStock, lowStock] = await Promise.all([
    prisma.productVariant.findMany({ where, orderBy: [{ stock: "asc" }, { updatedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize, include: { product: { select: { id: true, name: true, colors: true } } } }),
    prisma.productVariant.count({ where }),
    prisma.productVariant.count({ where: { deletedAt: null, isActive: true, stock: 0 } }),
    prisma.productVariant.count({ where: { deletedAt: null, isActive: true, stock: { gt: 0, lte: 5 } } }),
  ]);
  return { variants, total, outOfStock, lowStock, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getUsersPage(params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 20;
  const query = String(params.q ?? "").trim();
  const where = { deletedAt: null, ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : {}) };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { orders: true } } } }),
    prisma.user.count({ where }),
  ]);
  const userIds = users.map((user) => user.id);
  const orders = userIds.length ? await prisma.order.findMany({ where: { userId: { in: userIds }, deletedAt: null }, select: { userId: true, total: true, status: true, createdAt: true, shipPhone: true, payments: { where: { deletedAt: null }, take: 1 } }, orderBy: { createdAt: "desc" } }) : [];
  const summaries = new Map();
  for (const order of orders) {
    const summary = summaries.get(order.userId) ?? { totalSpent: 0, lastOrder: null, phone: null };
    if (isRealizedOrder(order)) summary.totalSpent += order.total;
    if (!summary.lastOrder) summary.lastOrder = order.createdAt;
    if (!summary.phone) summary.phone = order.shipPhone;
    summaries.set(order.userId, summary);
  }
  return { users: users.map((user) => ({ ...user, ...(summaries.get(user.id) ?? { totalSpent: 0, lastOrder: null, phone: null }) })), total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getNewsletterPage(params = {}) {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = [20, 50, 100].includes(Number(params.limit)) ? Number(params.limit) : 20;
  const query = String(params.q ?? "").trim();
  const where = { deletedAt: null, ...(query ? { email: { contains: query, mode: "insensitive" } } : {}) };
  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.newsletterSubscriber.count({ where }),
  ]);
  return { subscribers, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export { COD_ORDER_MATCH, ONLINE_PAID_MATCH, isCodMethod };
