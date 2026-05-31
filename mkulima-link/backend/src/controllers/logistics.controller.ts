import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { getDistance } from '../services/maps.service';
import { io } from '../index';
import { v4 as uuidv4 } from 'uuid';

export const listTransportProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county, vehicleType, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { available: true };
    if (county) where.counties = { has: county };
    if (vehicleType) where.vehicleType = vehicleType;

    const providers = await prisma.transportProvider.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, profilePhoto: true, county: true } },
      },
      orderBy: { rating: 'desc' },
    });
    res.json({ success: true, data: providers });
  } catch (err) {
    logger.error('List transport providers error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch providers' });
  }
};

export const getTransportProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const provider = await prisma.transportProvider.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, phone: true, profilePhoto: true, county: true } },
        deliveries: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!provider) {
      res.status(404).json({ success: false, message: 'Provider not found' });
      return;
    }
    res.json({ success: true, data: provider });
  } catch (err) {
    logger.error('Get transport provider error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch provider' });
  }
};

export const createTransportProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const {
      vehicleType, vehicleReg, capacity, capacityUnit, counties, pricePerKm,
      hasRefrigeration, licenseNumber,
    } = req.body;

    const existing = await prisma.transportProvider.findUnique({ where: { userId } });
    if (existing) {
      res.status(409).json({ success: false, message: 'Transport profile already exists' });
      return;
    }

    const provider = await prisma.transportProvider.create({
      data: {
        userId, vehicleType, vehicleReg, capacity: parseFloat(capacity),
        capacityUnit: capacityUnit || 'tonnes',
        counties: Array.isArray(counties) ? counties : [counties],
        pricePerKm: parseFloat(pricePerKm),
        hasRefrigeration: hasRefrigeration === 'true',
        licenseNumber,
      },
    });
    res.status(201).json({ success: true, data: provider });
  } catch (err) {
    logger.error('Create transport profile error', err);
    res.status(500).json({ success: false, message: 'Failed to create profile' });
  }
};

export const updateTransportProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const provider = await prisma.transportProvider.findUnique({ where: { id } });
    if (!provider || provider.userId !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.transportProvider.update({
      where: { id },
      data: {
        ...req.body,
        counties: req.body.counties ? (Array.isArray(req.body.counties) ? req.body.counties : [req.body.counties]) : undefined,
        capacity: req.body.capacity ? parseFloat(req.body.capacity) : undefined,
        pricePerKm: req.body.pricePerKm ? parseFloat(req.body.pricePerKm) : undefined,
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update transport profile error', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

export const bookTransport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, transportProviderId, pickupLat, pickupLng, deliveryLat, deliveryLng } = req.body;

    const [order, provider] = await Promise.all([
      prisma.order.findUnique({ where: { id: orderId } }),
      prisma.transportProvider.findUnique({ where: { id: transportProviderId } }),
    ]);

    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    if (!provider || !provider.available) { res.status(400).json({ success: false, message: 'Provider unavailable' }); return; }

    const distanceInfo = await getDistance(pickupLat, pickupLng, deliveryLat, deliveryLng);
    const deliveryFee = Math.round(distanceInfo.distance * provider.pricePerKm);
    const estimatedArrival = new Date(Date.now() + distanceInfo.duration * 60 * 1000);

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        transportProviderId,
        driverId: provider.userId,
        pickupLat, pickupLng, deliveryLat, deliveryLng,
        distance: distanceInfo.distance,
        estimatedArrival,
        trackingCode: `TRK-${uuidv4().slice(0, 8).toUpperCase()}`,
        trackingHistory: [{ status: 'PENDING', timestamp: new Date(), message: 'Delivery booked' }],
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { transportProviderId, deliveryFee },
    });

    io.to(`user-${provider.userId}`).emit('new-delivery', { deliveryId: delivery.id });

    res.status(201).json({
      success: true,
      data: { delivery, deliveryFee, estimatedArrival, trackingCode: delivery.trackingCode, distanceKm: distanceInfo.distance },
    });
  } catch (err) {
    logger.error('Book transport error', err);
    res.status(500).json({ success: false, message: 'Failed to book transport' });
  }
};

export const listDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const where: Record<string, unknown> = {};

    if (role === 'TRANSPORT_PROVIDER') {
      const provider = await prisma.transportProvider.findUnique({ where: { userId } });
      if (provider) where.transportProviderId = provider.id;
    } else {
      where.order = { OR: [{ buyerId: userId }, { farmerId: userId }] };
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        order: { select: { id: true, totalAmount: true, buyer: { select: { firstName: true, phone: true } }, farmer: { select: { firstName: true, phone: true } } } },
        transportProvider: { include: { user: { select: { firstName: true, phone: true } } } },
      },
    });

    res.json({ success: true, data: deliveries });
  } catch (err) {
    logger.error('List deliveries error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch deliveries' });
  }
};

export const getDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: { include: { items: { include: { product: { select: { name: true } } } } } },
        transportProvider: { include: { user: { select: { firstName: true, lastName: true, phone: true, profilePhoto: true } } } },
      },
    });
    if (!delivery) { res.status(404).json({ success: false, message: 'Delivery not found' }); return; }
    res.json({ success: true, data: delivery });
  } catch (err) {
    logger.error('Get delivery error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch delivery' });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!delivery) { res.status(404).json({ success: false, message: 'Delivery not found' }); return; }

    const historyEntry = { status, timestamp: new Date(), notes };
    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status,
        pickedUpAt: status === 'PICKED_UP' ? new Date() : undefined,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
        trackingHistory: { push: historyEntry },
        notes,
      },
    });

    if (status === 'DELIVERED') {
      await prisma.order.update({ where: { id: delivery.orderId }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
    }

    io.to(`delivery-${id}`).emit('delivery-update', { deliveryId: id, status });
    io.to(`user-${delivery.order.buyerId}`).emit('delivery-update', { deliveryId: id, status });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update delivery status error', err);
    res.status(500).json({ success: false, message: 'Failed to update delivery' });
  }
};

export const updateDriverLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;

    await prisma.delivery.update({ where: { id }, data: { currentLat: lat, currentLng: lng } });
    io.to(`delivery-${id}`).emit('driver-location', { deliveryId: id, lat, lng });

    res.json({ success: true });
  } catch (err) {
    logger.error('Update driver location error', err);
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
};

export const listWarehouses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { available: true };
    if (county) where.county = county;

    const warehouses = await prisma.warehouse.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { owner: { select: { firstName: true, lastName: true, phone: true } } },
      orderBy: { rating: 'desc' },
    });
    res.json({ success: true, data: warehouses });
  } catch (err) {
    logger.error('List warehouses error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch warehouses' });
  }
};
