import { Response } from "express";
import { prisma } from "@/config/db";
import { ok } from "@/utils/apiResponse";
import { AuthenticatedRequest } from "@/middleware/auth";

export async function getDashboardStats(_req: AuthenticatedRequest, res: Response) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    orderCount,
    customerCount,
    productCount,
    lowStockProducts,
    recentOrders,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { status: { in: ["PAID", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"] } }, _sum: { totalKes: true } }),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.$queryRaw<Array<{ id: string }>>`SELECT id FROM "Product" WHERE "stockQuantity" <= "lowStockThreshold" LIMIT 20`,
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true } } } }),
    prisma.review.count({ where: { isApproved: false } }),
  ]);

  return ok(res, {
    totalRevenueKes: totalRevenue._sum.totalKes ?? 0,
    ordersLast30Days: orderCount,
    customerCount,
    productCount,
    lowStockCount: Array.isArray(lowStockProducts) ? lowStockProducts.length : 0,
    recentOrders,
    pendingReviewCount: pendingReviews,
  });
}

export async function listCustomers(_req: AuthenticatedRequest, res: Response) {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      phoneVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok(res, customers);
}

export async function listAuditLogs(_req: AuthenticatedRequest, res: Response) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  return ok(res, logs);
}
