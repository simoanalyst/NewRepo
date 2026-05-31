import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as NotificationController from '../controllers/notification.controller';

const router = Router();
router.use(authenticate);
router.get('/', NotificationController.listNotifications);
router.patch('/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);
router.delete('/:id', NotificationController.deleteNotification);

export default router;
