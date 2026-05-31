import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { generatePriceForecast, getMarketInsights } from '../services/forecast.service';

export const getForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, county = 'Nairobi', days = '30' } = req.query as Record<string, string>;
    if (!product) {
      res.status(400).json({ success: false, message: 'Product name required' });
      return;
    }
    const forecast = await generatePriceForecast(product, county, parseInt(days));
    res.json({ success: true, data: forecast });
  } catch (err) {
    logger.error('Get forecast error', err);
    res.status(500).json({ success: false, message: 'Failed to generate forecast' });
  }
};

export const getInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county } = req.query as Record<string, string>;
    const insights = await getMarketInsights(county);
    res.json({ success: true, data: insights });
  } catch (err) {
    logger.error('Get insights error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch insights' });
  }
};

export const getSavedForecasts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, county, limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { forecastDate: { gte: new Date() } };
    if (product) where.productName = { contains: product, mode: 'insensitive' };
    if (county) where.county = county;

    const forecasts = await prisma.priceForecast.findMany({
      where,
      take: parseInt(limit),
      orderBy: [{ county: 'asc' }, { forecastDate: 'asc' }],
    });
    res.json({ success: true, data: forecasts });
  } catch (err) {
    logger.error('Get saved forecasts error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch forecasts' });
  }
};
