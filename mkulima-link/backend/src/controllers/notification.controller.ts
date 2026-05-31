import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { markNotificationsRead } from '../services/notification.service';

export const listNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { page = '1', limit = '20', unread } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { userId };
    if (unread === 'true') where.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    res.json({ success: true, data: { notifications, total, unreadCount } });
  } catch (err) {
    logger.error('List notifications error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    const { ids } = req.body;
    await markNotificationsRead(userId, ids);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    logger.error('Mark read error', err);
    res.status(500).json({ success: false, message: 'Failed to mark notifications' });
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user!;
    await markNotificationsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    logger.error('Mark all read error', err);
    res.status(500).json({ success: false, message: 'Failed to mark notifications' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    await prisma.notification.deleteMany({ where: { id, userId } });
    res.json({ success: true });
  } catch (err) {
    logger.error('Delete notification error', err);
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
};
