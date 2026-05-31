import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadProfilePhoto, uploadFarmPhotos } from '../middleware/upload';
import * as UserController from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.post('/profile/photo', uploadProfilePhoto.single('photo'), UserController.uploadProfilePhoto);
router.put('/farmer-profile', UserController.updateFarmerProfile);
router.post('/farmer-profile/photos', uploadFarmPhotos.array('photos', 10), UserController.uploadFarmPhotos);
router.put('/buyer-profile', UserController.updateBuyerProfile);
router.get('/stats', UserController.getUserStats);
router.get('/:id/public', UserController.getPublicProfile);

export default router;
