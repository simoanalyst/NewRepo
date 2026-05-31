import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as MarketController from '../controllers/market.controller';

const router = Router();

router.get('/prices', MarketController.getMarketPrices);
router.get('/prices/trends', MarketController.getPriceTrends);
router.get('/prices/counties', MarketController.getPricesByCounty);
router.get('/insights', MarketController.getMarketInsights);
router.post('/prices', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), MarketController.addMarketPrice);

export default router;
