import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { io } from '../index';
import { createNotification } from '../services/notification.service';

export const listOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, role } = req.user!;
    const { page = '1', limit = '20', status } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    if (role === 'FARMER') where.farmerId = userId;
    else if (['BUYER','WHOLESALER','RETAILER','EXPORTER'].includes(role)) where.buyerId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { name: true, unit: true, photos: true } } } },
          buyer: { select: { id: true, firstName: true, lastName: true, phone: true, profilePhoto: true } },
          farmer: { select: { id: true, firstName: true, lastName: true, phone: true, profilePhoto: true } },
          payments: { select: { id: true, status: true, amount: true, method: true } },
          delivery: { select: { id: true, status: true, trackingCode: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: { orders, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  } catch (err) {
    logger.error('List orders error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { category: true } } } },
        buyer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, county: true, profilePhoto: true, buyerProfile: true } },
        farmer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, county: true, profilePhoto: true, farmerProfile: true } },
        payments: true,
        delivery: { include: { transportProvider: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } } },
        reviews: true,
        transportProvider: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const isParticipant = order.buyerId === userId || order.farmerId === userId || ['ADMIN','SUPER_ADMIN'].includes(role);
    if (!isParticipant) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (err) {
    logger.error('Get order error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const buyerId = req.user!.userId;
    const { farmerId, items, notes, deliveryAddress, deliveryLat, deliveryLng, transportProviderId } = req.body;

    // Validate products and calculate total
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE', farmerId },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ success: false, message: 'One or more products are unavailable' });
      return;
    }

    let totalAmount = 0;
    const orderItems = items.map((item: { productId: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.productId)!;
      if (item.quantity < product.minOrderQty) {
        throw new Error(`Minimum order for ${product.name} is ${product.minOrderQty} ${product.unit}`);
      }
      const unitPrice = product.price;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;
      return { productId: item.productId, quantity: item.quantity, unitPrice, totalPrice, unit: product.unit };
    });

    const order = await prisma.order.create({
      data: {
        buyerId,
        farmerId,
        totalAmount,
        notes,
        deliveryAddress,
        deliveryLat: deliveryLat ? parseFloat(deliveryLat) : null,
        deliveryLng: deliveryLng ? parseFloat(deliveryLng) : null,
        transportProviderId,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { select: { name: true, unit: true } } } },
        buyer: { select: { firstName: true, lastName: true } },
        farmer: { select: { firstName: true, lastName: true } },
      },
    });

    // Notify farmer
    await createNotification(farmerId, 'New Order', `You have a new order from ${order.buyer.firstName}`, 'ORDER', { orderId: order.id });
    io.to(`user-${farmerId}`).emit('new-order', { orderId: order.id });

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (err) {
    logger.error('Create order error', err);
    if (err instanceof Error && err.message.includes('Minimum order')) {
      res.status(400).json({ success: false, message: err.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create order' });
    }
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user!;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const canUpdate =
      (role === 'FARMER' && order.farmerId === userId) ||
      (['BUYER','WHOLESALER','RETAILER','EXPORTER'].includes(role) && order.buyerId === userId) ||
      ['ADMIN','SUPER_ADMIN'].includes(role);

    if (!canUpdate) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const updated = await prisma.order.update({ where: { id }, data: { status } });

    // Notify other party
    const notifyId = role === 'FARMER' ? order.buyerId : order.farmerId;
    await createNotification(notifyId, 'Order Update', `Your order status has changed to ${status}`, 'ORDER', { orderId: id });
    io.to(`user-${notifyId}`).emit('order-update', { orderId: id, status });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Update order status error', err);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { userId } = req.user!;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    if (!cancellableStatuses.includes(order.status)) {
      res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
    });

    const notifyId = order.buyerId === userId ? order.farmerId : order.buyerId;
    await createNotification(notifyId, 'Order Cancelled', `Order has been cancelled. Reason: ${reason}`, 'ORDER', { orderId: id });

    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Cancel order error', err);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: orderId } = req.params;
    const { rating, comment, type } = req.body;
    const reviewerId = req.user!.userId;
    const role = req.user!.role;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Can only review completed orders' });
      return;
    }

    const revieweeId = role === 'FARMER' ? order.buyerId : order.farmerId;
    const reviewType = role === 'FARMER' ? 'FARMER_TO_BUYER' : 'BUYER_TO_FARMER';

    const review = await prisma.review.create({
      data: { reviewerId, revieweeId, orderId, rating: parseInt(rating), comment, type: type || reviewType },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    logger.error('Create review error', err);
    res.status(500).json({ success: false, message: 'Failed to create review' });
  }
};
