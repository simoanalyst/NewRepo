import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '../middleware/validate';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { uploadProductImages } from '../middleware/upload';
import * as ProductController from '../controllers/product.controller';

const router = Router();

router.get('/', optionalAuth, ProductController.listProducts);
router.get('/categories', ProductController.listCategories);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:id', optionalAuth, ProductController.getProduct);

router.post('/',
  authenticate,
  authorize('FARMER'),
  uploadProductImages.array('photos', 8),
  validate([
    body('name').notEmpty().trim().withMessage('Product name required'),
    body('categoryId').notEmpty().withMessage('Category required'),
    body('quantity').isFloat({ min: 0.1 }).withMessage('Valid quantity required'),
    body('unit').notEmpty().withMessage('Unit required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Valid price required'),
    body('county').notEmpty().withMessage('County required'),
  ]),
  ProductController.createProduct
);

router.put('/:id',
  authenticate,
  authorize('FARMER'),
  uploadProductImages.array('photos', 8),
  ProductController.updateProduct
);

router.delete('/:id', authenticate, authorize('FARMER', 'ADMIN', 'SUPER_ADMIN'), ProductController.deleteProduct);
router.patch('/:id/status', authenticate, authorize('FARMER', 'ADMIN', 'SUPER_ADMIN'), ProductController.updateProductStatus);

export default router;
