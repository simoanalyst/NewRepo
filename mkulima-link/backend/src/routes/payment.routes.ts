import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as PaymentController from '../controllers/payment.controller';

const router = Router();

router.post('/mpesa/stk-push',
  authenticate,
  validate([
    body('orderId').notEmpty(),
    body('phoneNumber').matches(/^(\+254|0)[17]\d{8}$/),
  ]),
  PaymentController.initiateMpesaPayment
);

router.post('/mpesa/callback', PaymentController.mpesaCallback);
router.post('/mpesa/b2c/result', PaymentController.mpesaB2CResult);
router.get('/mpesa/status/:checkoutRequestId', authenticate, PaymentController.checkPaymentStatus);
router.get('/order/:orderId', authenticate, PaymentController.getOrderPayments);

export default router;
