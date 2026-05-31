import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import paymentRoutes from './payment.routes';
import marketRoutes from './market.routes';
import forecastRoutes from './forecast.routes';
import logisticsRoutes from './logistics.routes';
import userRoutes from './user.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import advisoryRoutes from './advisory.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/market', marketRoutes);
router.use('/forecast', forecastRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/advisory', advisoryRoutes);

export default router;
