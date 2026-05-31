import axios from 'axios';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { getCache, setCache } from '../config/redis';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5';

// Kenya county coordinates
const COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  Nairobi: { lat: -1.286389, lng: 36.817223 },
  Mombasa: { lat: -4.043477, lng: 39.668206 },
  Kisumu: { lat: -0.091702, lng: 34.767956 },
  Nakuru: { lat: -0.303099, lng: 36.080026 },
  Eldoret: { lat: 0.520360, lng: 35.269780 },
  Meru: { lat: 0.046520, lng: 37.649620 },
  Nyeri: { lat: -0.416974, lng: 36.947701 },
  Kiambu: { lat: -1.031111, lng: 36.796944 },
  Machakos: { lat: -1.516667, lng: 37.266667 },
  Kakamega: { lat: 0.283333, lng: 34.750000 },
  Kisii: { lat: -0.681690, lng: 34.766160 },
  Bungoma: { lat: 0.563600, lng: 34.559600 },
  'Trans Nzoia': { lat: 1.017000, lng: 34.999000 },
  Bomet: { lat: -0.783400, lng: 35.343600 },
  Nandi: { lat: 0.183300, lng: 35.116700 },
  Uasin_Gishu: { lat: 0.520360, lng: 35.269780 },
};

export async function getWeatherForCounty(county: string): Promise<Record<string, unknown>> {
  const cacheKey = `weather:${county}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached as Record<string, unknown>;

  const coords = COUNTY_COORDS[county] || COUNTY_COORDS.Nairobi;

  if (!OPENWEATHER_API_KEY) {
    const mockData = generateMockWeather(county, coords);
    await setCache(cacheKey, mockData, 3600);
    return mockData;
  }

  try {
    const [current, forecast] = await Promise.all([
      axios.get(`${OPENWEATHER_URL}/weather`, {
        params: { lat: coords.lat, lon: coords.lng, appid: OPENWEATHER_API_KEY, units: 'metric' },
      }),
      axios.get(`${OPENWEATHER_URL}/forecast`, {
        params: { lat: coords.lat, lon: coords.lng, appid: OPENWEATHER_API_KEY, units: 'metric', cnt: 40 },
      }),
    ]);

    const data = {
      county,
      temperature: Math.round(current.data.main.temp),
      feelsLike: Math.round(current.data.main.feels_like),
      humidity: current.data.main.humidity,
      rainfall: current.data.rain?.['1h'] || 0,
      windSpeed: Math.round(current.data.wind.speed * 3.6),
      condition: current.data.weather[0].description,
      icon: current.data.weather[0].icon,
      forecast: processForecast(forecast.data.list),
      source: 'openweather',
      recordedAt: new Date(),
    };

    // Save to DB
    await prisma.weatherData.create({
      data: {
        county,
        temperature: data.temperature,
        humidity: data.humidity,
        rainfall: data.rainfall,
        windSpeed: data.windSpeed,
        condition: data.condition,
        forecast: data.forecast,
      },
    });

    await setCache(cacheKey, data, 3600); // Cache 1 hour
    return data;
  } catch (err) {
    logger.error('Weather API error', err);
    const mockData = generateMockWeather(county, coords);
    await setCache(cacheKey, mockData, 1800);
    return mockData;
  }
}

function processForecast(list: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const daily: Record<string, Array<Record<string, unknown>>> = {};
  for (const item of list) {
    const date = (item.dt_txt as string).split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  }

  return Object.entries(daily).slice(0, 7).map(([date, items]) => {
    const temps = items.map((i) => (i.main as Record<string, number>).temp);
    const descriptions = items.map((i) => ((i.weather as Array<Record<string, string>>)[0]).description);
    const rainfall = items.reduce((sum, i) => sum + ((i.rain as Record<string, number>)?.['3h'] || 0), 0);
    return {
      date,
      tempMin: Math.round(Math.min(...temps)),
      tempMax: Math.round(Math.max(...temps)),
      condition: descriptions[Math.floor(descriptions.length / 2)],
      rainfall: Math.round(rainfall * 10) / 10,
    };
  });
}

function generateMockWeather(county: string, coords: { lat: number; lng: number }): Record<string, unknown> {
  const isCoastal = coords.lat < -2;
  const baseTemp = isCoastal ? 28 : 22;
  const conditions = ['Partly Cloudy', 'Sunny', 'Light Rain', 'Overcast', 'Clear'];
  const today = new Date();

  return {
    county,
    temperature: baseTemp + Math.floor(Math.random() * 6) - 3,
    feelsLike: baseTemp - 2,
    humidity: isCoastal ? 75 : 60,
    rainfall: Math.random() > 0.7 ? Math.round(Math.random() * 10) : 0,
    windSpeed: 12,
    condition: conditions[Math.floor(Math.random() * conditions.length)],
    icon: '02d',
    forecast: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(today.getTime() + (i + 1) * 86400000).toISOString().split('T')[0],
      tempMin: baseTemp - 5,
      tempMax: baseTemp + 3,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      rainfall: Math.random() > 0.6 ? Math.round(Math.random() * 15) : 0,
    })),
    source: 'mock',
    recordedAt: new Date(),
  };
}
