import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as AdminController from '../controllers/admin.controller';

const router = Router();
router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.listUsers);
router.get('/users/:id', AdminController.getUser);
router.patch('/users/:id/status', AdminController.toggleUserStatus);
router.get('/products', AdminController.listProductsForModeration);
router.patch('/products/:id/moderate', AdminController.moderateProduct);
router.get('/orders', AdminController.listAllOrders);
router.get('/transactions', AdminController.listTransactions);
router.get('/analytics', AdminController.getAnalytics);
router.post('/market-prices/bulk', AdminController.bulkImportMarketPrices);
router.post('/categories', AdminController.createCategory);

export default router;
