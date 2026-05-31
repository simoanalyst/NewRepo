import { Router } from 'express';
import * as ForecastController from '../controllers/forecast.controller';

const router = Router();
router.get('/', ForecastController.getForecast);
router.get('/insights', ForecastController.getInsights);
router.get('/saved', ForecastController.getSavedForecasts);

export default router;
