import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const getDashboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers, totalFarmers, totalBuyers, totalProducts,
      totalOrders, completedOrders, totalRevenue,
      newUsersThisMonth, ordersThisMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'FARMER' } }),
      prisma.user.count({ where: { role: { in: ['BUYER', 'WHOLESALER', 'RETAILER', 'EXPORTER'] } } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
      prisma.order.count({ where: { createdAt: { gte: new Date(new Date().setDate(1)) } } }),
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, farmers: totalFarmers, buyers: totalBuyers, newThisMonth: newUsersThisMonth },
        products: { active: totalProducts },
        orders: { total: totalOrders, completed: completedOrders, thisMonth: ordersThisMonth },
        revenue: { total: totalRevenue._sum.amount || 0 },
      },
    });
  } catch (err) {
    logger.error('Admin dashboard error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', role, search, isActive } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, phone: true, firstName: true, lastName: true,
          role: true, county: true, isVerified: true, isActive: true,
          profilePhoto: true, createdAt: true, lastLoginAt: true,
          _count: { select: { products: true, buyerOrders: true, farmerOrders: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: { users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } },
    });
  } catch (err) {
    logger.error('Admin list users error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { farmerProfile: true, buyerProfile: true, transportProvider: true },
    });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (err) {
    logger.error('Admin get user error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    const user = await prisma.user.update({ where: { id }, data: { isActive } });
    logger.info(`User ${id} ${isActive ? 'activated' : 'suspended'}: ${reason}`);
    res.json({ success: true, data: { id: user.id, isActive: user.isActive } });
  } catch (err) {
    logger.error('Toggle user status error', err);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

export const listProductsForModeration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', status } = req.query as Record<string, string>;
    const where = status ? { status: status as 'ACTIVE' } : {};
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          farmer: { select: { firstName: true, lastName: true, phone: true, county: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ success: true, data: { products, total } });
  } catch (err) {
    logger.error('List products moderation error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const moderateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const updated = await prisma.product.update({ where: { id }, data: { status } });
    logger.info(`Product ${id} moderated to ${status}: ${reason}`);
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Moderate product error', err);
    res.status(500).json({ success: false, message: 'Failed to moderate product' });
  }
};

export const listAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', status } = req.query as Record<string, string>;
    const where = status ? { status: status as 'PENDING' } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { firstName: true, lastName: true, phone: true } },
          farmer: { select: { firstName: true, lastName: true, phone: true } },
          payments: { select: { status: true, amount: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, data: { orders, total } });
  } catch (err) {
    logger.error('List all orders error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const listTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '50', status } = req.query as Record<string, string>;
    const where = status ? { status: status as 'COMPLETED' } : {};
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
          order: { select: { id: true, totalAmount: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);
    res.json({ success: true, data: { payments, total } });
  } catch (err) {
    logger.error('List transactions error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '30' } = req.query as Record<string, string>;
    const since = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const [userGrowth, orderVolume, revenueByDay, topProducts, topCounties] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], where: { createdAt: { gte: since } }, _count: true }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.payment.groupBy({
        by: ['createdAt'],
        where: { status: 'COMPLETED', createdAt: { gte: since } },
        _sum: { amount: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _count: true,
        _sum: { totalPrice: true },
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      }),
      prisma.order.groupBy({
        by: ['farmerId'],
        where: { createdAt: { gte: since } },
        _count: true,
        _sum: { totalAmount: true },
        take: 10,
        orderBy: { _sum: { totalAmount: 'desc' } },
      }),
    ]);

    res.json({ success: true, data: { userGrowth, orderVolume, revenueByDay, topProducts, topCounties } });
  } catch (err) {
    logger.error('Get analytics error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

export const bulkImportMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prices } = req.body;
    if (!Array.isArray(prices)) { res.status(400).json({ success: false, message: 'Prices array required' }); return; }

    const data = prices.map((p: Record<string, unknown>) => ({
      productName: p.productName as string,
      category: p.category as string,
      county: p.county as string,
      price: parseFloat(p.price as string),
      unit: p.unit as string,
      date: p.date ? new Date(p.date as string) : new Date(),
      source: (p.source as string) || 'bulk_import',
      minPrice: p.minPrice ? parseFloat(p.minPrice as string) : null,
      maxPrice: p.maxPrice ? parseFloat(p.maxPrice as string) : null,
      avgPrice: p.avgPrice ? parseFloat(p.avgPrice as string) : parseFloat(p.price as string),
    }));

    const result = await prisma.marketPrice.createMany({ data, skipDuplicates: true });
    res.json({ success: true, data: { imported: result.count } });
  } catch (err) {
    logger.error('Bulk import error', err);
    res.status(500).json({ success: false, message: 'Bulk import failed' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, icon, description, parentId } = req.body;
    const category = await prisma.category.create({ data: { name, slug, icon, description, parentId } });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    logger.error('Create category error', err);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};
