import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        role: true, county: true, subCounty: true, ward: true,
        isVerified: true, profilePhoto: true, createdAt: true,
        farmerProfile: true,
        buyerProfile: true,
        transportProvider: true,
      },
    });

    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (err) {
    logger.error('Get profile error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { firstName, lastName, county, subCounty, ward, email } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, county, subCounty, ward, email },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        role: true, county: true, subCounty: true, profilePhoto: true,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update profile error', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const uploadProfilePhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    if (!req.file) { res.status(400).json({ success: false, message: 'No photo uploaded' }); return; }
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    await prisma.user.update({ where: { id: userId }, data: { profilePhoto: photoUrl } });
    res.json({ success: true, data: { photoUrl } });
  } catch (err) {
    logger.error('Upload profile photo error', err);
    res.status(500).json({ success: false, message: 'Failed to upload photo' });
  }
};

export const updateFarmerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { farmSize, farmSizeUnit, farmLocation, gpsLat, gpsLng, mainCrops, livestockTypes, bio, irrigationType, soilType } = req.body;

    const profile = await prisma.farmerProfile.upsert({
      where: { userId },
      create: {
        userId, farmSize: farmSize ? parseFloat(farmSize) : null, farmSizeUnit,
        farmLocation, gpsLat: gpsLat ? parseFloat(gpsLat) : null,
        gpsLng: gpsLng ? parseFloat(gpsLng) : null,
        mainCrops: Array.isArray(mainCrops) ? mainCrops : mainCrops ? [mainCrops] : [],
        livestockTypes: Array.isArray(livestockTypes) ? livestockTypes : livestockTypes ? [livestockTypes] : [],
        bio, irrigationType, soilType,
      },
      update: {
        farmSize: farmSize ? parseFloat(farmSize) : undefined, farmSizeUnit,
        farmLocation, gpsLat: gpsLat ? parseFloat(gpsLat) : undefined,
        gpsLng: gpsLng ? parseFloat(gpsLng) : undefined,
        mainCrops: Array.isArray(mainCrops) ? mainCrops : mainCrops ? [mainCrops] : undefined,
        livestockTypes: Array.isArray(livestockTypes) ? livestockTypes : livestockTypes ? [livestockTypes] : undefined,
        bio, irrigationType, soilType,
      },
    });
    res.json({ success: true, data: profile });
  } catch (err) {
    logger.error('Update farmer profile error', err);
    res.status(500).json({ success: false, message: 'Failed to update farmer profile' });
  }
};

export const uploadFarmPhotos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) { res.status(400).json({ success: false, message: 'No photos uploaded' }); return; }

    const photoUrls = files.map((f) => `/uploads/farms/${f.filename}`);
    const profile = await prisma.farmerProfile.update({
      where: { userId },
      data: { farmPhotos: { push: photoUrls } },
    });
    res.json({ success: true, data: { photos: photoUrls, profile } });
  } catch (err) {
    logger.error('Upload farm photos error', err);
    res.status(500).json({ success: false, message: 'Failed to upload farm photos' });
  }
};

export const updateBuyerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { businessName, businessType, kraPin, businessAddress, preferredProducts, monthlyBudget } = req.body;

    const profile = await prisma.buyerProfile.upsert({
      where: { userId },
      create: {
        userId, businessName, businessType, kraPin, businessAddress,
        preferredProducts: Array.isArray(preferredProducts) ? preferredProducts : [],
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null,
      },
      update: {
        businessName, businessType, kraPin, businessAddress,
        preferredProducts: Array.isArray(preferredProducts) ? preferredProducts : undefined,
        monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
      },
    });
    res.json({ success: true, data: profile });
  } catch (err) {
    logger.error('Update buyer profile error', err);
    res.status(500).json({ success: false, message: 'Failed to update buyer profile' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;

    if (role === 'FARMER') {
      const [productCount, orderCount, revenue, avgRating] = await Promise.all([
        prisma.product.count({ where: { farmerId: userId, status: 'ACTIVE' } }),
        prisma.order.count({ where: { farmerId: userId, status: { in: ['COMPLETED', 'DELIVERED'] } } }),
        prisma.order.aggregate({ where: { farmerId: userId, paymentStatus: 'COMPLETED' }, _sum: { totalAmount: true } }),
        prisma.review.aggregate({ where: { revieweeId: userId }, _avg: { rating: true } }),
      ]);
      res.json({ success: true, data: { productCount, orderCount, revenue: revenue._sum.totalAmount || 0, avgRating: avgRating._avg.rating || 0 } });
    } else {
      const [orderCount, totalSpent, activeOrders] = await Promise.all([
        prisma.order.count({ where: { buyerId: userId } }),
        prisma.order.aggregate({ where: { buyerId: userId, paymentStatus: 'COMPLETED' }, _sum: { totalAmount: true } }),
        prisma.order.count({ where: { buyerId: userId, status: { in: ['PENDING', 'CONFIRMED', 'IN_TRANSIT'] } } }),
      ]);
      res.json({ success: true, data: { orderCount, totalSpent: totalSpent._sum.totalAmount || 0, activeOrders } });
    }
  } catch (err) {
    logger.error('Get user stats error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, firstName: true, lastName: true, county: true, profilePhoto: true,
        role: true, createdAt: true,
        farmerProfile: { select: { farmSize: true, farmLocation: true, mainCrops: true, bio: true, farmPhotos: true } },
        receivedReviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { firstName: true, lastName: true, profilePhoto: true } } },
        },
        products: {
          where: { status: 'ACTIVE' },
          take: 6,
          include: { category: { select: { name: true } } },
        },
      },
    });
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (err) {
    logger.error('Get public profile error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};
