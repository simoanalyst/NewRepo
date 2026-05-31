import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<RedisClientType> {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          logger.error('Redis: Too many reconnection attempts');
          return new Error('Too many retries');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  }) as RedisClientType;

  redisClient.on('error', (err) => logger.error('Redis Client Error', err));
  redisClient.on('connect', () => logger.info('Redis connected'));
  redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
  redisClient.on('ready', () => logger.info('Redis ready'));

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.error('Redis setCache error', err);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err) {
    logger.error('Redis getCache error', err);
    return null;
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (err) {
    logger.error('Redis deleteCache error', err);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    logger.error('Redis deleteCachePattern error', err);
  }
}
