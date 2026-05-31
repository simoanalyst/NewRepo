import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

router.post('/register',
  validate([
    body('phone').matches(/^(\+254|0)[17]\d{8}$/).withMessage('Invalid Kenyan phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().trim().withMessage('First name is required'),
    body('lastName').notEmpty().trim().withMessage('Last name is required'),
    body('role').isIn(['FARMER','BUYER','WHOLESALER','RETAILER','EXPORTER','TRANSPORT_PROVIDER','COOPERATIVE_MANAGER']).withMessage('Invalid role'),
    body('county').notEmpty().withMessage('County is required'),
  ]),
  AuthController.register
);

router.post('/login',
  validate([
    body('identifier').notEmpty().withMessage('Phone or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  AuthController.login
);

router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/forgot-password',
  validate([body('identifier').notEmpty().withMessage('Phone or email required')]),
  AuthController.forgotPassword
);
router.post('/reset-password',
  validate([
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ]),
  AuthController.resetPassword
);
router.post('/verify-email',
  validate([body('token').notEmpty()]),
  AuthController.verifyEmail
);
router.post('/verify-phone',
  validate([body('otp').isLength({ min: 6, max: 6 }).isNumeric()]),
  authenticate,
  AuthController.verifyPhone
);
router.post('/send-otp', authenticate, AuthController.sendOtp);

export default router;
