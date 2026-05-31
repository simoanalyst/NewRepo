import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as OrderController from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.get('/', OrderController.listOrders);
router.get('/:id', OrderController.getOrder);
router.post('/',
  validate([
    body('farmerId').notEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').notEmpty(),
    body('items.*.quantity').isFloat({ min: 0.1 }),
  ]),
  OrderController.createOrder
);
router.patch('/:id/status', OrderController.updateOrderStatus);
router.post('/:id/cancel', OrderController.cancelOrder);
router.post('/:id/review', validate([body('rating').isInt({ min: 1, max: 5 })]), OrderController.createReview);

export default router;
