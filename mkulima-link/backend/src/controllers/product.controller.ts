import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { getCache, setCache, deleteCache } from '../config/redis';
import { ProductStatus } from '@prisma/client';

export const listProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1', limit = '20', county, category, minPrice, maxPrice,
      search, status = 'ACTIVE', sort = 'createdAt', order = 'desc',
      organic, farmerId,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { status: status as ProductStatus };
    if (county) where.county = county;
    if (organic === 'true') where.organicCertified = true;
    if (farmerId) where.farmerId = farmerId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }
    if (category) {
      where.category = { OR: [{ id: category }, { slug: category }] };
    }

    const validSorts = ['price', 'createdAt', 'viewCount', 'quantity'];
    const sortField = validSorts.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortOrder },
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          farmer: {
            select: {
              id: true, firstName: true, lastName: true, county: true, profilePhoto: true,
              farmerProfile: { select: { rating: false, gpsLat: true, gpsLng: true, farmLocation: true } },
            },
          },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  } catch (err) {
    logger.error('List products error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        farmer: {
          select: {
            id: true, firstName: true, lastName: true, county: true, phone: true,
            profilePhoto: true, createdAt: true,
            farmerProfile: true,
            receivedReviews: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: { reviewer: { select: { firstName: true, lastName: true, profilePhoto: true } } },
            },
          },
        },
        orderItems: { select: { id: true } },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Increment view count
    await prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    res.json({ success: true, data: product });
  } catch (err) {
    logger.error('Get product error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmerId = req.user!.userId;
    const files = req.files as Express.Multer.File[];
    const photos = files ? files.map((f) => `/uploads/products/${f.filename}`) : [];

    const {
      name, categoryId, description, quantity, unit, grade, price, minOrderQty,
      harvestDate, expiryDate, county, subCounty, location, gpsLat, gpsLng,
      organicCertified, certificationNo, tags,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        farmerId,
        categoryId,
        name,
        description,
        quantity: parseFloat(quantity),
        unit,
        grade,
        price: parseFloat(price),
        minOrderQty: minOrderQty ? parseFloat(minOrderQty) : 1,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        county,
        subCounty,
        location,
        gpsLat: gpsLat ? parseFloat(gpsLat) : null,
        gpsLng: gpsLng ? parseFloat(gpsLng) : null,
        photos,
        organicCertified: organicCertified === 'true',
        certificationNo,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      },
      include: { category: true },
    });

    await deleteCache('products:*');
    res.status(201).json({ success: true, message: 'Product created successfully', data: product });
  } catch (err) {
    logger.error('Create product error', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const farmerId = req.user!.userId;
    const role = req.user!.role;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    if (product.farmerId !== farmerId && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const newPhotos = files ? files.map((f) => `/uploads/products/${f.filename}`) : [];
    const existingPhotos = req.body.existingPhotos
      ? Array.isArray(req.body.existingPhotos) ? req.body.existingPhotos : [req.body.existingPhotos]
      : product.photos;
    const photos = [...existingPhotos, ...newPhotos];

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...req.body,
        photos,
        quantity: req.body.quantity ? parseFloat(req.body.quantity) : undefined,
        price: req.body.price ? parseFloat(req.body.price) : undefined,
        harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        organicCertified: req.body.organicCertified !== undefined ? req.body.organicCertified === 'true' : undefined,
      },
      include: { category: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update product error', err);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    logger.error('Delete product error', err);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const updateProductStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.product.update({ where: { id }, data: { status } });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update status error', err);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cached = await getCache('featured-products');
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      take: 12,
      orderBy: { viewCount: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        farmer: { select: { firstName: true, lastName: true, county: true, profilePhoto: true } },
      },
    });

    await setCache('featured-products', products, 600);
    res.json({ success: true, data: products });
  } catch (err) {
    logger.error('Featured products error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
};

export const listCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cached = await getCache('categories');
    if (cached) {
      res.json({ success: true, data: cached });
      return;
    }

    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    await setCache('categories', categories, 3600);
    res.json({ success: true, data: categories });
  } catch (err) {
    logger.error('List categories error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};
