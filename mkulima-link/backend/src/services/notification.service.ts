import { prisma } from '../config/database';
import { NotificationType } from '@prisma/client';
import { logger } from '../config/logger';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, data },
    });
  } catch (err) {
    logger.error('Create notification error', err);
  }
}

export async function markNotificationsRead(userId: string, ids?: string[]): Promise<void> {
  try {
    const where = ids ? { id: { in: ids }, userId } : { userId, read: false };
    await prisma.notification.updateMany({ where, data: { read: true, readAt: new Date() } });
  } catch (err) {
    logger.error('Mark notifications read error', err);
  }
}
