import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { getCache, setCache } from '../config/redis';
import { getMarketInsights } from '../services/forecast.service';

export const getMarketPrices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county, product, days = '7', limit = '100' } = req.query as Record<string, string>;
    const cacheKey = `market-prices:${county}:${product}:${days}`;
    const cached = await getCache(cacheKey);
    if (cached) { res.json({ success: true, data: cached }); return; }

    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const where: Record<string, unknown> = { date: { gte: since } };
    if (county) where.county = county;
    if (product) where.productName = { contains: product, mode: 'insensitive' };

    const prices = await prisma.marketPrice.findMany({
      where,
      take: parseInt(limit),
      orderBy: { date: 'desc' },
    });

    await setCache(cacheKey, prices, 1800);
    res.json({ success: true, data: prices });
  } catch (err) {
    logger.error('Get market prices error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch market prices' });
  }
};

export const getPriceTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product, county, days = '30' } = req.query as Record<string, string>;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const where: Record<string, unknown> = { date: { gte: since } };
    if (county) where.county = county;
    if (product) where.productName = { contains: product, mode: 'insensitive' };

    const prices = await prisma.marketPrice.findMany({
      where,
      orderBy: { date: 'asc' },
      select: { productName: true, county: true, avgPrice: true, price: true, date: true, unit: true },
    });

    // Group by product and date
    const grouped: Record<string, Array<{ date: string; price: number }>> = {};
    for (const p of prices) {
      const key = `${p.productName} (${p.county || 'National'})`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ date: p.date.toISOString().split('T')[0], price: p.avgPrice || p.price });
    }

    res.json({ success: true, data: grouped });
  } catch (err) {
    logger.error('Get price trends error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch price trends' });
  }
};

export const getPricesByCounty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product } = req.query as Record<string, string>;
    if (!product) {
      res.status(400).json({ success: false, message: 'Product name required' });
      return;
    }

    const latest = await prisma.marketPrice.findMany({
      where: {
        productName: { contains: product, mode: 'insensitive' },
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      distinct: ['county'],
      orderBy: [{ county: 'asc' }, { date: 'desc' }],
    });

    res.json({ success: true, data: latest });
  } catch (err) {
    logger.error('Get prices by county error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch county prices' });
  }
};

export const getMarketInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const { county } = req.query as Record<string, string>;
    const insights = await getMarketInsights(county);
    res.json({ success: true, data: insights });
  } catch (err) {
    logger.error('Get market insights error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch insights' });
  }
};

export const addMarketPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, category, county, price, unit, date, source, minPrice, maxPrice, avgPrice } = req.body;
    const record = await prisma.marketPrice.create({
      data: {
        productName, category, county, price: parseFloat(price), unit,
        date: date ? new Date(date) : new Date(),
        source: source || 'manual',
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        avgPrice: avgPrice ? parseFloat(avgPrice) : parseFloat(price),
      },
    });
    res.status(201).json({ success: true, data: record });
  } catch (err) {
    logger.error('Add market price error', err);
    res.status(500).json({ success: false, message: 'Failed to add market price' });
  }
};
