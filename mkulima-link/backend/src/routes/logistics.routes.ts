import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as LogisticsController from '../controllers/logistics.controller';

const router = Router();

router.get('/providers', LogisticsController.listTransportProviders);
router.get('/providers/:id', LogisticsController.getTransportProvider);
router.post('/providers', authenticate, authorize('TRANSPORT_PROVIDER'), LogisticsController.createTransportProfile);
router.put('/providers/:id', authenticate, authorize('TRANSPORT_PROVIDER'), LogisticsController.updateTransportProfile);
router.post('/book', authenticate, LogisticsController.bookTransport);
router.get('/deliveries', authenticate, LogisticsController.listDeliveries);
router.get('/deliveries/:id', authenticate, LogisticsController.getDelivery);
router.patch('/deliveries/:id/status', authenticate, LogisticsController.updateDeliveryStatus);
router.patch('/deliveries/:id/location', authenticate, LogisticsController.updateDriverLocation);
router.get('/warehouses', LogisticsController.listWarehouses);

export default router;
