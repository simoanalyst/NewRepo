import { prisma } from '../config/database';
import { logger } from '../config/logger';

// Kenya crop seasonal factors (month 1-12, multiplier)
const SEASONAL_FACTORS: Record<string, number[]> = {
  maize:    [0.9, 0.85, 0.8, 0.9, 1.2, 1.3, 1.1, 1.0, 0.95, 0.9, 1.0, 1.1],
  tomatoes: [1.1, 1.0, 0.95, 1.1, 1.3, 1.2, 1.0, 0.9, 1.0, 1.1, 1.2, 1.15],
  potatoes: [1.0, 1.0, 1.1, 1.0, 1.2, 1.1, 0.9, 0.85, 0.9, 1.0, 1.1, 1.05],
  beans:    [0.9, 0.85, 0.8, 0.9, 1.1, 1.2, 1.0, 0.95, 0.9, 0.85, 0.9, 1.0],
  default:  [1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.0, 0.95, 0.95, 1.0, 1.05, 1.05],
};

// Kenya weather-based factor (county average rainfall influence)
const COUNTY_WEATHER_VOLATILITY: Record<string, number> = {
  Nairobi: 0.05, Mombasa: 0.08, Kisumu: 0.07, Nakuru: 0.06,
  Eldoret: 0.06, Meru: 0.07, Nyeri: 0.06, Kiambu: 0.05,
};

interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  const n = x.length;
  if (n < 2) return { slope: 0, intercept: y[0] || 0, r2: 0 };

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // R² coefficient
  for (let i = 0; i < n; i++) {
    ssTot += (y[i] - yMean) ** 2;
  }
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { slope, intercept, r2: Math.max(0, r2) };
}

function getSeasonalFactor(productName: string, month: number): number {
  const key = productName.toLowerCase();
  const factors = SEASONAL_FACTORS[key] || SEASONAL_FACTORS.default;
  return factors[month - 1];
}

export interface ForecastResult {
  productName: string;
  county: string;
  forecasts: Array<{
    date: string;
    predictedPrice: number;
    confidence: number;
    trend: string;
    factors: Record<string, unknown>;
  }>;
  historicalAvg: number;
  currentTrend: string;
  seasonalOutlook: string;
}

export async function generatePriceForecast(
  productName: string,
  county: string,
  daysAhead = 30
): Promise<ForecastResult> {
  try {
    // Get historical market prices (last 90 days)
    const historicalPrices = await prisma.marketPrice.findMany({
      where: {
        productName: { contains: productName, mode: 'insensitive' },
        county,
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { date: 'asc' },
    });

    if (historicalPrices.length < 3) {
      // Not enough data - use national average with seasonal adjustment
      return generateFallbackForecast(productName, county, daysAhead);
    }

    const x = historicalPrices.map((_, i) => i);
    const y = historicalPrices.map((p) => p.avgPrice || p.price);
    const regression = linearRegression(x, y);
    const avgPrice = y.reduce((a, b) => a + b, 0) / y.length;
    const volatility = COUNTY_WEATHER_VOLATILITY[county] || 0.08;

    const forecasts = [];
    const today = new Date();

    for (let day = 1; day <= daysAhead; day += 7) { // Weekly forecasts
      const forecastDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
      const futureX = historicalPrices.length + Math.floor(day / 1);
      const basePrice = regression.slope * futureX + regression.intercept;

      const month = forecastDate.getMonth() + 1;
      const seasonalFactor = getSeasonalFactor(productName, month);
      const predictedPrice = Math.max(1, basePrice * seasonalFactor);

      // Confidence decreases with time and low R²
      const timeDecay = Math.max(0.3, 1 - (day / daysAhead) * 0.5);
      const confidence = Math.min(0.95, regression.r2 * timeDecay * (1 - volatility));

      const trend = regression.slope > 0.5 ? 'Rising' : regression.slope < -0.5 ? 'Falling' : 'Stable';

      forecasts.push({
        date: forecastDate.toISOString().split('T')[0],
        predictedPrice: Math.round(predictedPrice * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        trend,
        factors: {
          seasonal: seasonalFactor,
          trendSlope: Math.round(regression.slope * 100) / 100,
          r2Score: Math.round(regression.r2 * 100) / 100,
          volatility,
          dataPoints: historicalPrices.length,
        },
      });
    }

    const overallTrend = regression.slope > 1 ? 'Rising' : regression.slope < -1 ? 'Falling' : 'Stable';
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).getMonth() + 1;
    const nextSeasonalFactor = getSeasonalFactor(productName, nextMonth);
    const seasonalOutlook = nextSeasonalFactor > 1.1
      ? 'Expect price increase due to seasonal demand'
      : nextSeasonalFactor < 0.9
        ? 'Prices may drop due to harvest season'
        : 'Prices expected to remain stable';

    // Save forecasts to DB
    await prisma.priceForecast.createMany({
      data: forecasts.map((f) => ({
        productName,
        category: 'general',
        county,
        predictedPrice: f.predictedPrice,
        forecastDate: new Date(f.date),
        confidence: f.confidence,
        factors: f.factors,
        model: 'linear_regression_seasonal',
      })),
      skipDuplicates: true,
    });

    return {
      productName,
      county,
      forecasts,
      historicalAvg: Math.round(avgPrice * 100) / 100,
      currentTrend: overallTrend,
      seasonalOutlook,
    };
  } catch (err) {
    logger.error('Forecast generation error', err);
    return generateFallbackForecast(productName, county, daysAhead);
  }
}

function generateFallbackForecast(productName: string, county: string, daysAhead: number): ForecastResult {
  // Default prices for common Kenya crops (KES per kg)
  const defaultPrices: Record<string, number> = {
    maize: 45, tomatoes: 60, potatoes: 50, beans: 120, cabbage: 25,
    onions: 80, carrots: 55, spinach: 40, kale: 30, avocado: 70,
  };
  const key = productName.toLowerCase();
  const basePrice = defaultPrices[key] || 80;

  const today = new Date();
  const forecasts = [];

  for (let day = 1; day <= daysAhead; day += 7) {
    const forecastDate = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
    const month = forecastDate.getMonth() + 1;
    const seasonalFactor = getSeasonalFactor(productName, month);
    const predictedPrice = basePrice * seasonalFactor;

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: 0.4, // Low confidence for fallback
      trend: 'Stable',
      factors: { seasonal: seasonalFactor, source: 'default_estimate', dataPoints: 0 },
    });
  }

  return {
    productName, county, forecasts,
    historicalAvg: basePrice,
    currentTrend: 'Stable',
    seasonalOutlook: 'Insufficient data for detailed forecast',
  };
}

export async function getMarketInsights(county?: string): Promise<Record<string, unknown>> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const where = county ? { county, date: { gte: thirtyDaysAgo } } : { date: { gte: thirtyDaysAgo } };

  const prices = await prisma.marketPrice.findMany({ where, orderBy: { date: 'desc' } });

  const byProduct: Record<string, number[]> = {};
  for (const p of prices) {
    if (!byProduct[p.productName]) byProduct[p.productName] = [];
    byProduct[p.productName].push(p.avgPrice || p.price);
  }

  const insights = Object.entries(byProduct).map(([product, priceList]) => {
    const avg = priceList.reduce((a, b) => a + b, 0) / priceList.length;
    const min = Math.min(...priceList);
    const max = Math.max(...priceList);
    const volatility = ((max - min) / avg) * 100;
    const recent = priceList.slice(0, 5);
    const older = priceList.slice(5, 10);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / (recent.length || 1);
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    const trend = recentAvg > olderAvg * 1.05 ? 'rising' : recentAvg < olderAvg * 0.95 ? 'falling' : 'stable';

    return { product, avg: Math.round(avg), min, max, volatility: Math.round(volatility), trend };
  });

  return { insights, county: county || 'National', generatedAt: new Date() };
}
